import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./ShopPage.css";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { ThemeContext } from "../context/ThemeContext";

const ShopPage = () => {
    const [products, setProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("");
    const [category, setCategory] = useState("");

    const { addToCart } = useContext(CartContext);
    const { addToWishlist } = useContext(WishlistContext);
    const { theme } = useContext(ThemeContext);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const selectedCategory = params.get("category") || "";
        setCategory(selectedCategory);
    }, [location.search]);

    useEffect(() => {
        const fetchProductsAndTokens = async () => {
            try {
                let url = "http://localhost:8080/products";

                if (sortOrder === "review") {
                    url = "http://localhost:8080/products/sort/review";
                } else if (sortOrder === "sold") {
                    url = "http://localhost:8080/products/sort/sold";
                } else if (category) {
                    url += `?categorie=${category}`;
                }

                const resProducts = await fetch(url);
                const data = await resProducts.json();

                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("id");

                let tokens = [];
                if (token && userId) {
                    const resTokens = await fetch(`http://localhost:8080/api/matching-price/tokens/user/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (resTokens.ok) {
                        tokens = await resTokens.json();
                    }
                }

                const adjustedProducts = Array.isArray(data) ? data.map(p => {
                    if (!p || !p.id) return p;
                    const match = tokens.find(t => t.productId === p.id);
                    if (match) {
                        return {
                            ...p,
                            initialPrice: p.price,
                            price: match.approvedPrice
                        };
                    }
                    return p;
                }) : [];

                setProducts(adjustedProducts);

                const recommended = [...adjustedProducts]
                    .sort((a, b) => b.sold - a.sold)
                    .slice(0, 3);
                setRecommendedProducts(recommended);

                const ids = JSON.parse(localStorage.getItem("recentProducts")) || [];
                const recentFiltered = adjustedProducts.filter(p => ids.includes(p.id));
                setRecentProducts(recentFiltered);
            } catch (err) {
                console.error("❌ Eroare la fetch produse + token:", err);
            }
        };

        fetchProductsAndTokens();
    }, [category, sortOrder]);

    const handleProductClick = (id) => {
        navigate(`/product/${id}`);
    };

    const filteredProducts = products
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortOrder === "asc") return a.price - b.price;
            if (sortOrder === "desc") return b.price - a.price;
            return 0;
        });

    const responsive = {
        desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3 },
        tablet: { breakpoint: { max: 1024, min: 768 }, items: 2 },
        mobile: { breakpoint: { max: 768, min: 0 }, items: 1 }
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return "http://localhost:8080/uploads/default.png";
        return imageUrl.startsWith("http") ? imageUrl : `http://localhost:8080/uploads/${imageUrl}`;
    };

    return (
        <div className={`shop-container ${theme === "dark" ? "dark" : ""}`}>
            <h2 className={`shop-title ${theme === "dark" ? "dark" : ""}`}>🔌 Electronice disponibile</h2>

            <div className="filters">
                <input
                    type="text"
                    placeholder="🔍 Caută produs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-filter"
                />
                <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder} className="sort-filter">
                    <option value="">Sortează</option>
                    <option value="asc">Preț crescător</option>
                    <option value="desc">Preț descrescător</option>
                    <option value="review">Scor recenzie</option>
                    <option value="sold">Cele mai vândute</option>
                </select>
                <select onChange={(e) => setCategory(e.target.value)} value={category} className="category-filter">
                    <option value="">Toate categoriile</option>
                    <option value="TELEFON">Telefoane</option>
                    <option value="TABLETA">Tablete</option>
                    <option value="LAPTOP">Laptopuri</option>
                </select>
            </div>

            {filteredProducts.length === 0 ? (
                <p className="loading-text">Nu există produse...</p>
            ) : (
                <Carousel responsive={responsive} infinite autoPlay autoPlaySpeed={3000} keyBoardControl>
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            className="product-card"
                            onClick={() => handleProductClick(product.id)}
                            style={{ cursor: "pointer" }}
                        >
                            <img src={getImageUrl(product.imageUrl)} alt={product.name} className="product-image" />
                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-description">{product.description}</p>

                            {product.initialPrice && product.initialPrice > product.price ? (
                                <div>
                                    <span className="discount-badge">Reducere</span>
                                    <p className="old-price">{product.initialPrice.toFixed(2)} RON</p>
                                    <p className="product-price reduced">{product.price.toFixed(2)} RON</p>
                                </div>
                            ) : (
                                <p className="product-price">{product.price.toFixed(2)} RON</p>
                            )}
                        </div>
                    ))}
                </Carousel>
            )}

            {recommendedProducts.length > 0 && (
                <>
                    <h3 className="shop-title">🔥 Recomandate</h3>
                    <div className="recommended-container">
                        {recommendedProducts.map(product => (
                            <div
                                key={product.id}
                                className="product-card"
                                onClick={() => handleProductClick(product.id)}
                            >
                                <img src={getImageUrl(product.imageUrl)} alt={product.name} className="product-image" />
                                <h3 className="product-name">{product.name}</h3>
                                <p className="product-price">{product.price.toFixed(2)} RON</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {recentProducts.length > 0 && (
                <>
                    <h3 className="shop-title">🕓 Vizualizate Recent</h3>
                    <div className="recent-container">
                        {recentProducts.map(product => (
                            <div
                                key={product.id}
                                className="product-card"
                                onClick={() => handleProductClick(product.id)}
                            >
                                <img src={getImageUrl(product.imageUrl)} alt={product.name} className="product-image" />
                                <h3 className="product-name">{product.name}</h3>
                                <p className="product-price">{product.price.toFixed(2)} RON</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ShopPage;
