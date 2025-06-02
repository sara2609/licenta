import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const MatchingPriceForm = () => {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [requestedPrice, setRequestedPrice] = useState(0);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("id");

        if (!token || !userId) {
            setError("Trebuie să fii autentificat.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/matching-price/create", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    userId,
                    productId,
                    message,
                    requestedPrice
                })
            });

            if (response.ok) {
                alert("✅ Cererea ta a fost trimisă către admin.");
                navigate("/shop");
            } else {
                const text = await response.text();
                throw new Error(text);
            }
        } catch (err) {
            setError("Eroare la trimitere: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="matching-form-container">
            <h2>Cere Matching Price</h2>
            <form onSubmit={handleSubmit} className="matching-form">
                <label>
                    Preț dorit (RON):
                    <input
                        type="number"
                        step="0.01"
                        value={requestedPrice}
                        onChange={(e) => setRequestedPrice(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Mesaj către admin:
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows="4"
                        placeholder="Ex: Am văzut produsul mai ieftin pe alt site."
                        required
                    ></textarea>
                </label>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "Se trimite..." : "Trimite cererea"}
                </button>
            </form>
        </div>
    );
};

export default MatchingPriceForm;
