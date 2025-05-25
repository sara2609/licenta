import React, { useContext, useEffect } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { ThemeContext } from "../context/ThemeContext"; // ✅ Adăugat pentru temă
import { useNavigate } from "react-router-dom";
import "./ShopPage.css";

const WishlistPage = () => {
    const { wishlistItems, removeFromWishlist } = useContext(WishlistContext);
    const { theme } = useContext(ThemeContext); // ✅ Preluăm tema curentă
    const navigate = useNavigate();

    useEffect(() => {
        const isGuest = localStorage.getItem("isGuest");
        if (isGuest === "true" || !localStorage.getItem("token")) {
            alert("🔐 Trebuie să fii autentificat pentru a accesa wishlist-ul.");
            navigate("/login");
        }
    }, [navigate]);

    const handleMoveToCart = async (product) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch(`http://localhost:8080/wishlist/move-to-cart/${product.id}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            const text = await res.text();

            if (res.ok) {
                alert(text);
                window.location.reload();
            } else {
                alert("❌ " + text);
            }
        } catch (error) {
            console.error("❌ Eroare mutare în coș:", error);
        }
    };

    return (
        <div className={`shop-container ${theme === "dark" ? "dark-mode" : ""}`}>
            <h2 className={`shop-title ${theme === "dark" ? "dark" : ""}`}>❤️ Produsele tale favorite</h2>
            {wishlistItems.length === 0 ? (
                <p className="loading-text">Nu ai produse în wishlist.</p>
            ) : (
                <div className="product-grid">
                    {wishlistItems.map((product) => (
                        <div key={product.id} className="product-card">
                            {product.imageUrl && (
                                <img src={product.imageUrl} alt={product.name} className="product-image" />
                            )}
                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-description">{product.description}</p>
                            <p className="product-price">{product.price.toFixed(2)} RON</p>
                            <div className="product-actions">
                                <button className="wishlist-button" onClick={() => removeFromWishlist(product.id)}>
                                    ❌ Șterge
                                </button>
                                <button className="cart-button" onClick={() => handleMoveToCart(product)}>
                                    🛒 Mută în coș
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
