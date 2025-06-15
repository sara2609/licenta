import React, { useContext } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { ThemeContext } from "../context/ThemeContext";
import "./WishlistPage.css";

const WishlistPage = () => {
    const { wishlistItems, removeFromWishlist } = useContext(WishlistContext);
    const { theme } = useContext(ThemeContext);

    const handleMoveToCart = async (product) => {
        const token = localStorage.getItem("token");
        if (!token) return alert("🔒 Trebuie să fii logat pentru a muta în coș.");

        try {
            const res = await fetch(`http://localhost:8080/wishlist/move-to-cart/${product.id}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            const text = await res.text();
            alert(res.ok ? "✅ " + text : "❌ " + text);

            if (res.ok) window.location.reload(); // reîncarcă lista
        } catch (err) {
            console.error("❌ Eroare la mutare în coș:", err);
        }
    };

    const getImageUrl = (img) =>
        !img
            ? "http://localhost:8080/uploads/default.png"
            : img.startsWith("http")
                ? img
                : `http://localhost:8080/uploads/${img}`;

    return (
        <div className={`wishlist-container ${theme === "dark" ? "dark" : ""}`}>
            <h2>❤️ Produsele tale favorite</h2>

            {wishlistItems.length === 0 ? (
                <p>Nu ai produse în wishlist.</p>
            ) : (
                wishlistItems.map((p) => (
                    <div key={p.id} className="wishlist-item">
                        <img src={getImageUrl(p.imageUrl)} alt={p.name} className="wishlist-img" />
                        <div className="wishlist-info">
                            <h3>{p.name}</h3>
                            <p className="desc">{p.description}</p>
                            <p className="price">{p.price.toFixed(2)} RON</p>

                            <div className="wishlist-actions">
                                <button className="btn remove" onClick={() => removeFromWishlist(p.id)}>
                                    🗑️ Șterge
                                </button>

                                {p.stock > 0 ? (
                                    <button className="btn move" onClick={() => handleMoveToCart(p)}>
                                        🛒 Mută în coș
                                    </button>
                                ) : (
                                    <span className="stock-label">🚫 Stoc epuizat</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default WishlistPage;
