import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import "./ProductPage.css";

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");

                const productRes = await fetch(`http://localhost:8080/products/${id}`);
                if (!productRes.ok) throw new Error("Eroare la aducerea produsului.");
                const productData = await productRes.json();
                setProduct(productData);

                const viewed = JSON.parse(localStorage.getItem("recentProducts")) || [];
                const updated = [Number(id), ...viewed.filter(pid => pid !== Number(id))];
                localStorage.setItem("recentProducts", JSON.stringify(updated.slice(0, 5)));

                const reviewsRes = await fetch(`http://localhost:8080/reviews/product/${id}`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });
                if (!reviewsRes.ok) throw new Error("Eroare la aducerea review-urilor.");
                const reviewsData = await reviewsRes.json();
                setReviews(reviewsData);
            } catch (error) {
                console.error(error.message);
            }
        };

        fetchData();
    }, [id]);

    const handleAddToCart = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("🔒 Trebuie să fii logat pentru a adăuga în coș.");
            navigate("/login");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/cart/add/${id}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert("✅ Produs adăugat în coș!");
                addToCart(product);
            } else if (response.status === 403) {
                alert("⚠️ Token expirat. Reconectează-te.");
                localStorage.removeItem("token");
                navigate("/login");
            } else {
                const errorText = await response.text();
                console.error("❌ Server error:", errorText);
                alert("❌ Eroare la adăugare în coș!");
            }
        } catch (err) {
            console.error("❌ Fetch error:", err);
            alert("❌ Eroare de rețea!");
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        if (!token) {
            if (window.confirm("Trebuie să fii logat pentru a trimite un review. Vrei să mergi la login?")) {
                navigate("/login");
            }
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/reviews/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ productId: Number(id), rating, comment })
            });

            if (response.ok) {
                alert("✅ Review trimis cu succes!");
                setComment("");
                setRating(5);

                const updatedReviews = await fetch(`http://localhost:8080/reviews/product/${id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const updatedData = await updatedReviews.json();
                setReviews(updatedData);
            } else {
                const errorText = await response.text();
                console.error("❌ Server error:", errorText);
                alert("❌ Eroare la trimiterea review-ului!");
            }
        } catch (error) {
            console.error("❌ Review fetch error:", error);
            alert("❌ Eroare rețea!");
        }
    };

    if (!product) return <p>🔄 Se încarcă produsul...</p>;

    return (
        <div className="product-page-container">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p><strong>Preț:</strong> {product.price.toFixed(2)} RON</p>
            <p>
                <strong>Stoc:</strong>{" "}
                {product.stock > 0 ? product.stock : <span style={{ color: "red" }}>Indisponibil</span>}
            </p>

            {/* ✅ Afișăm detalii suplimentare dacă există */}
            {product.details && (
                <div className="extra-details">
                    <h4>📋 Detalii specifice</h4>
                    <ul>
                        {Object.entries(JSON.parse(product.details)).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {product.stock > 0 ? (
                <button onClick={handleAddToCart}>🛒 Adaugă în coș</button>
            ) : (
                <button disabled className="out-of-stock">
                    <span className="out-of-stock-text">Stoc epuizat</span>
                </button>
            )}

            <hr />

            <h3>⭐ Review-uri</h3>
            {reviews.length === 0 ? (
                <p>Nu există review-uri pentru acest produs.</p>
            ) : (
                reviews.map((r) => (
                    <div key={r.id || r.idreview || r.idReview} className="review-item">
                        <p><strong>Rating:</strong> {r.rating} / 5</p>
                        <p><strong>Comentariu:</strong> {r.comment}</p>
                    </div>
                ))
            )}

            <hr />

            <h3>✍️ Scrie un review</h3>
            <form onSubmit={handleSubmitReview} className="review-form">
                <label>Rating:
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                        {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                </label>

                <textarea
                    placeholder="Scrie comentariul tău..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                />

                <button type="submit">🚀 Trimite Review</button>
            </form>
        </div>
    );
};

export default ProductPage;
