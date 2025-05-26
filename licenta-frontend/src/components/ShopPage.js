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
    const [messageText, setMessageText] = useState("");

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
        let url = "http://localhost:8080/products";

        if (sortOrder === "review") {
            url = "http://localhost:8080/products/sort/review";
        } else if (category) {
            url += `?categorie=${category}`;
        }

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                const recommended = data.sort((a, b) => b.price - a.price).slice(0, 3);
                setRecommendedProducts(recommended);

                let ids = JSON.parse(localStorage.getItem("recentProducts")) || [];
                if (ids.length === 0 && data.length >= 2) {
                    ids = [data[0].id, data[1].id];
                    localStorage.setItem("recentProducts", JSON.stringify(ids));
                }
                const recentFiltered = data.filter(p => ids.includes(p.id));
                setRecentProducts(recentFiltered);
            })
            .catch(err => console.error("Eroare la preluarea produselor:", err));
    }, [category, sortOrder]);

    const handleSendMessage = async () => {
        if (!messageText.trim()) {
            alert("Scrie un mesaj înainte de a trimite!");
            return;
        }
        try {
            const response = await fetch("http://localhost:8080/messages/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ senderEmail: "anonim@example.com", content: messageText })
            });
            if (response.ok) {
                alert("✅ Mesaj trimis cu succes!");
                setMessageText("");
            } else {
                throw new Error("Eroare la trimiterea mesajului");
            }
        } catch (error) {
            console.error(error);
            alert("❌ Eroare la trimiterea mesajului!");
        }
    };

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
                            <p className="product-price">{product.price.toFixed(2)} RON</p>

                            <div className="product-actions">
                                {product.stock > 0 ? (
                                    <button
                                        className="cart-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(product);
                                            alert("✅ Produs adăugat în coș!");
                                        }}
                                    >
                                        🛒 În coș
                                    </button>
                                ) : (
                                    <button
                                        className="cart-button"
                                        disabled
                                        style={{ backgroundColor: "gray", cursor: "not-allowed", color: "white" }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Stoc epuizat
                                    </button>
                                )}
                                <button
                                    className="wishlist-button"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        const result = await addToWishlist(product);
                                        if (result) alert(result);
                                    }}
                                >
                                    ❤️
                                </button>
                            </div>
                        </div>
                    ))}
                </Carousel>
            )}

            {recommendedProducts.length > 0 && (
                <>
                    <h3>🔝 Recomandate</h3>
                    <div className="recommended-container">
                        {recommendedProducts.map(prod => (
                            <div key={prod.id} className="product-card" onClick={() => handleProductClick(prod.id)}>
                                <img src={getImageUrl(prod.imageUrl)} alt={prod.name} className="product-image" />
                                <h4>{prod.name}</h4>
                                <p>{prod.description}</p>
                                <p style={{ color: "red" }}>{prod.price.toFixed(2)} RON</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {recentProducts.length > 0 && (
                <>
                    <h3>👀 Vizualizate recent</h3>
                    <div className="recent-container">
                        {recentProducts.map(prod => (
                            <div key={prod.id} className="product-card" onClick={() => handleProductClick(prod.id)}>
                                <img src={getImageUrl(prod.imageUrl)} alt={prod.name} className="product-image" />
                                <h4>{prod.name}</h4>
                                <p>{prod.description}</p>
                                <p style={{ color: "red" }}>{prod.price.toFixed(2)} RON</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {theme !== "dark" && (
                <div className="send-message-container">
                    <h3>📝 Trimite un mesaj</h3>
                    <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Scrie mesajul tău aici..."
                        className="message-textarea"
                    />
                    <button onClick={handleSendMessage} className="send-message-button">
                        ✉️ Trimite
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShopPage;
