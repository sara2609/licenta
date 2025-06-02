import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import "./ProductPage.css";

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [tokenMP, setTokenMP] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const { addToCart, addToCartWithToken } = useContext(CartContext);
    const userId = localStorage.getItem("id");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");

                const productRes = await fetch(`http://localhost:8080/products/${id}`);
                const productData = await productRes.json();

                // 🟢 Matching Price: caută token valabil
                if (token && userId) {
                    const tokensRes = await fetch(`http://localhost:8080/api/matching-price/tokens/user/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (tokensRes.ok) {
                        const tokensData = await tokensRes.json();
                        const match = tokensData.find(t => t.productId === productData.id);
                        if (match) {
                            productData.initialPrice = productData.price;
                            productData.price = match.approvedPrice;
                            setTokenMP(match.token);
                        }
                    }
                }

                setProduct(productData);

                // ✅ Marcare produse recent vizitate
                const viewed = JSON.parse(localStorage.getItem("recentProducts")) || [];
                const updated = [Number(id), ...viewed.filter(pid => pid !== Number(id))];
                localStorage.setItem("recentProducts", JSON.stringify(updated.slice(0, 5)));

                const reviewsRes = await fetch(`http://localhost:8080/reviews/product/${id}`);
                const reviewsData = await reviewsRes.json();
                setReviews(reviewsData);
            } catch (err) {
                console.error("❌ Eroare încărcare produs:", err);
            }
        };

        fetchData();
    }, [id, userId]);

    const handleAddToCart = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("🔒 Trebuie să fii logat pentru a adăuga în coș.");
            navigate("/login");
            return;
        }

        try {
            if (tokenMP) {
                await addToCartWithToken(product.id, tokenMP);
            } else {
                await addToCart(product);
            }
        } catch (err) {
            console.error("❌ Eroare la adăugare în coș:", err);
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

                const updatedRes = await fetch(`http://localhost:8080/reviews/product/${id}`);
                const updatedData = await updatedRes.json();
                setReviews(updatedData);
            } else {
                const errText = await response.text();
                alert("❌ Eroare review: " + errText);
            }
        } catch (error) {
            console.error("❌ Review error:", error);
        }
    };

    if (!product) return <p>🔄 Se încarcă produsul...</p>;

    return (
        <div className="product-page-container">
            <h2>{product.name}</h2>
            <p>{product.description}</p>

            {product.initialPrice && product.initialPrice > product.price ? (
                <p>
                    <strong>Preț: </strong>
                    <span style={{ textDecoration: "line-through", color: "gray" }}>
                        {product.initialPrice.toFixed(2)} RON
                    </span>{" "}
                    <span style={{ color: "green", fontWeight: "bold" }}>
                        {product.price.toFixed(2)} RON
                    </span>{" "}
                    <span style={{
                        background: "#e1fbe1",
                        color: "green",
                        padding: "2px 6px",
                        borderRadius: "5px",
                        fontSize: "0.9em"
                    }}>
                        Matching Price ✅
                    </span>
                </p>
            ) : (
                <p><strong>Preț:</strong> {product.price.toFixed(2)} RON</p>
            )}

            <p>
                <strong>Stoc:</strong>{" "}
                {product.stock > 0 ? product.stock : <span style={{ color: "red" }}>Indisponibil</span>}
            </p>

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

            {userId && (
                <div style={{ marginTop: "15px" }}>
                    <Link to={`/matching-price/request/${id}`}>
                        <button className="matching-price-btn">💰 Cere Matching Price</button>
                    </Link>
                </div>
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
