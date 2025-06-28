
import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { ThemeContext } from "../context/ThemeContext";
import "./ProductPage.css";

const ProductPage = () => {
    const { id } = useParams();
    const { addToCart } = useContext(CartContext);
    const { theme } = useContext(ThemeContext);

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");


    const getImageUrl = (img) =>
        !img
            ? "http://localhost:8080/uploads/default.png"
            : img.startsWith("http")
                ? img
                : `http://localhost:8080${img.startsWith("/uploads") ? "" : "/uploads/"}${img}`;

    useEffect(() => {
        (async () => {

            const p = await fetch(`http://localhost:8080/products/${id}`).then((r) => r.json());


            let finalP = p;
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("id");

            if (token && userId) {
                const tRes = await fetch(
                    `http://localhost:8080/api/matching-price/tokens/user/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (tRes.ok) {
                    const tokens = await tRes.json();
                    const match = tokens.find((t) => t.productId === p.id);
                    if (match) {
                        finalP = { ...p, initialPrice: p.price, price: match.approvedPrice };
                    }
                }
            }


            const rv = await fetch(`http://localhost:8080/reviews/product/${id}`).then((r) => r.json());

            setProduct(finalP);
            setReviews(Array.isArray(rv) ? rv : rv?.reviews || []);


            const key = "recentProducts";
            let recents = JSON.parse(localStorage.getItem(key)) || [];
            recents = recents.filter((pid) => pid !== p.id);
            recents.unshift(p.id);
            if (recents.length > 10) recents = recents.slice(0, 10);
            localStorage.setItem(key, JSON.stringify(recents));
        })();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Trebuie să fii logat ca să lași un review.");
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/reviews/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId: id, rating, comment }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Eroare necunoscută");
            }

            const rv = await fetch(`http://localhost:8080/reviews/product/${id}`).then((r) => r.json());
            setReviews(Array.isArray(rv) ? rv : rv?.reviews || []);
            setRating(5);
            setComment("");
        } catch (err) {
            console.error("❌ Review post:", err);
            alert("Nu s-a putut trimite review-ul: " + err.message);
        }
    };

    if (!product) return <p style={{ textAlign: "center" }}>Se încarcă produsul…</p>;

    let specs = [];
    if (product.details) {
        try {
            const parsed =
                typeof product.details === "string"
                    ? JSON.parse(product.details)
                    : product.details;
            specs = Object.entries(parsed).map(([k, v]) => ({ name: k, value: v }));
        } catch {

        }
    }

    return (
        <div className={`product-page ${theme === "dark" ? "dark" : ""}`}>
            <h2>{product.name}</h2>

            <img
                className="product-main-img"
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
            />

            <p className="product-desc">{product.description}</p>

            <div className="price-box">
                {product.initialPrice && product.initialPrice > product.price && (
                    <>
                        <span className="discount-badge">Reducere</span>
                        <p className="old-price">{product.initialPrice.toFixed(2)} RON</p>
                    </>
                )}

                <p className={`product-price${product.initialPrice ? " reduced" : ""}`}>
                    {product.price.toFixed(2)} RON
                </p>
            </div>

            <p>
                <strong>Stoc:</strong> {product.stock}
            </p>

            <button className="add-cart-btn" onClick={() => addToCart(product)}>
                🛒 Adaugă în coș
            </button>

            {specs.length > 0 && (
                <div className="specs-card">
                    <h3 className="specs-title">📋 Detalii tehnice</h3>
                    <table className="specs-table">
                        <tbody>
                        {specs.map((s) => (
                            <tr key={s.name}>
                                <th>{s.name}</th>
                                <td>{s.value}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <hr style={{ margin: "30px 0" }} />

            <h3>⭐ Review-uri</h3>
            {reviews.length === 0 ? (
                <p>Nu există review-uri pentru acest produs.</p>
            ) : (
                reviews.map((r) => (
                    <div key={r.id} className="review-box">
                        <strong>{r.username || "Anonim"}</strong>
                        <p>⭐ {r.rating} / 5</p>
                        <p>{r.comment}</p>
                    </div>
                ))
            )}

            <h3 className="form-title">Lasă un review</h3>
            <form className="review-form" onSubmit={handleSubmit}>
                <select value={rating} onChange={(e) => setRating(+e.target.value)}>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n}>{n}</option>
                    ))}
                </select>
                <textarea
                    placeholder="Comentariul tău"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <button type="submit">Trimite</button>
            </form>
        </div>
    );
};

export default ProductPage;
