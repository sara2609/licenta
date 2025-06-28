
import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

import "./ShopPage.css";
import { WishlistContext } from "../context/WishlistContext";
import { ThemeContext } from "../context/ThemeContext";

const ShopPage = () => {
    const [products, setProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("");
    const [category, setCategory] = useState("");

    const { addToWishlist, wishlistItems } = useContext(WishlistContext);
    const { theme } = useContext(ThemeContext);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setCategory(params.get("category") || "");
    }, [location.search]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let url = "http://localhost:8080/products";
                if (sortOrder === "review") url = "http://localhost:8080/products/sort/review";
                else if (sortOrder === "sold") url = "http://localhost:8080/products/sort/sold";
                else if (category) url += `?categorie=${category}`;

                const res = await fetch(url);
                const data = await res.json();

                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("id");
                let tokens = [];

                if (token && userId) {
                    const tRes = await fetch(
                        `http://localhost:8080/api/matching-price/tokens/user/${userId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (tRes.ok) tokens = await tRes.json();
                }

                const adj = Array.isArray(data)
                    ? data.map(p => {
                        const m = tokens.find(t => t.productId === p.id);
                        return m ? { ...p, initialPrice: p.price, price: m.approvedPrice } : p;
                    })
                    : [];

                setProducts(adj);
                setRecommendedProducts([...adj].sort((a, b) => b.sold - a.sold).slice(0, 3));

                const ids = JSON.parse(localStorage.getItem("recentProducts")) || [];
                setRecentProducts(adj.filter(p => ids.includes(p.id)));
            } catch (e) {
                console.error("❌ Fetch produse:", e);
            }
        };
        fetchData();
    }, [category, sortOrder]);

    const handleProductClick = id => navigate(`/product/${id}`);

    const filtered = products
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) =>
            sortOrder === "asc" ? a.price - b.price :
                sortOrder === "desc" ? b.price - a.price : 0
        );

    const responsive = {
        desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3 },
        tablet: { breakpoint: { max: 1024, min: 768 }, items: 2 },
        mobile: { breakpoint: { max: 768, min: 0 }, items: 1 },
    };

    const getImg = img =>
        !img ? "http://localhost:8080/uploads/default.png"
            : img.startsWith("http") ? img
                : `http://localhost:8080/uploads/${img}`;

    const ArrowLeft = ({ onClick }) => (
        <button className="shop-nav-arrow left" onClick={onClick}>‹</button>
    );

    const ArrowRight = ({ onClick }) => (
        <button className="shop-nav-arrow right" onClick={onClick}>›</button>
    );

    const ProductCard = ({ product }) => {
        const fav = wishlistItems.some(w => w.id === product.id);

        return (
            <div className="product-card" onClick={() => handleProductClick(product.id)}>
                <button
                    className={`wishlist-float ${fav ? "fav" : ""}`}
                    title={fav ? "În favorite" : "Adaugă în wishlist"}
                    onClick={async e => {
                        e.stopPropagation();
                        const msg = await addToWishlist(product);
                        if (msg) alert(msg);
                    }}
                >
                    ❤️
                </button>

                <img src={getImg(product.imageUrl)} alt={product.name} className="product-image" />
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>

                {product.initialPrice && product.initialPrice > product.price && (
                    <>
                        <span className="discount-badge">Reducere</span>
                        <p className="old-price">{product.initialPrice.toFixed(2)} RON</p>
                    </>
                )}

                <p className={`product-price${product.initialPrice ? " reduced" : ""}`}>
                    {product.price.toFixed(2)} RON
                </p>

                {(!product.stock || product.stock <= 0) && <p className="stock-label">Stoc epuizat</p>}
            </div>
        );
    };

    return (
        <div className={`shop-container ${theme === "dark" ? "dark" : ""}`}>
            <h2 className={`shop-title ${theme === "dark" ? "dark" : ""}`}>
                🔌 Electronice disponibile
            </h2>

            <div className="filters">
                <input
                    type="text"
                    placeholder="🔍 Caută produs..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="search-filter"
                />
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="sort-filter">
                    <option value="">Sortează</option>
                    <option value="asc">Preț crescător</option>
                    <option value="desc">Preț descrescător</option>
                    <option value="review">Scor recenzie</option>
                    <option value="sold">Cele mai vândute</option>
                </select>
                <select value={category} onChange={e => setCategory(e.target.value)} className="category-filter">
                    <option value="">Toate categoriile</option>
                    <option value="TELEFON">Telefoane</option>
                    <option value="TABLETA">Tablete</option>
                    <option value="LAPTOP">Laptopuri</option>
                </select>
            </div>

            {filtered.length === 0 ? (
                <p className="loading-text">Nu există produse...</p>
            ) : (
                <>
                    <div className="carousel-wrapper">
                        <Carousel
                            responsive={responsive}
                            infinite
                            autoPlay
                            autoPlaySpeed={3000}
                            customLeftArrow={<ArrowLeft />}
                            customRightArrow={<ArrowRight />}
                        >
                            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
                        </Carousel>
                    </div>
                    <div className="section-separator" />
                </>
            )}

            {recommendedProducts.length > 0 && (
                <>
                    <h3 className="shop-subtitle">🔥 Recomandate</h3>
                    <div className="recommended-container">
                        {recommendedProducts.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                    <div className="section-separator" />
                </>
            )}

            {recentProducts.length > 0 && (
                <>
                    <h3 className="shop-subtitle">🕓 Vizualizate Recent</h3>
                    <div className="recent-container">
                        {recentProducts.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </>
            )}
        </div>
    );
};

export default ShopPage;
