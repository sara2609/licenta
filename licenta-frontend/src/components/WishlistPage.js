import React, { useContext, useEffect } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import "./ShopPage.css";

const WishlistPage = () => {
    const { wishlistItems, removeFromWishlist } = useContext(WishlistContext);
    const { theme } = useContext(ThemeContext);
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
        <div className={`wishlist-container ${theme === "dark" ? "dark" : ""}`}>
            <h2>❤️ Produsele tale favorite</h2>
            {wishlistItems.length === 0 ? (
                <p className="loading-text">Nu ai produse în wishlist.</p>
            ) : (
                <div className="product-grid">
                    {wishlistItems.map((product) => (
                        <div key={product.id} className="wishlist-card">
                            {product.imageUrl && (
                                <img src={product.imageUrl} alt={product.name} className="product-image" />
                            )}
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <p><strong>{product.price.toFixed(2)} RON</strong></p>
                            <div className="product-actions">
                                <button className="wishlist-button" onClick={() => removeFromWishlist(product.id)}>
                                    ❌ Șterge
                                </button>
                                {product.stock > 0 ? (
                                    <button className="cart-button" onClick={() => handleMoveToCart(product)}>
                                        🛒 Mută în coș
                                    </button>
                                ) : (
                                    <button className="cart-button disabled" disabled>
                                        🚫 Stoc epuizat
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
