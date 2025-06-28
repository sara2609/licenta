import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, applyPointsToCart } = useContext(CartContext);
    const navigate = useNavigate();

    const [availablePoints, setAvailablePoints] = useState(0);
    const [usedPoints, setUsedPoints] = useState({});
    const [totalAfterDiscount, setTotalAfterDiscount] = useState(null);

    useEffect(() => {
        fetchPoints();
    }, []);

    const fetchPoints = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch("http://localhost:8080/api/rewards/points", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAvailablePoints(data);
            }
        } catch (err) {
            console.error("Eroare la fetch puncte:", err);
        }
    };

    const handleApplyPoints = async () => {
        const total = Object.values(usedPoints).reduce((sum, v) => sum + v, 0);
        if (total > availablePoints) {
            alert("⚠️ Nu ai suficiente puncte disponibile.");
            return;
        }

        await applyPointsToCart(usedPoints);
        let totalDiscount = 0;

        cartItems.forEach(item => {
            const p = usedPoints[item.productId] || 0;
            const discountRate = 0.05 * (p / 100);
            const disc = discountRate * item.price * item.quantity;
            totalDiscount += disc;
        });

        alert(`✅ Ai aplicat punctele! Reducere totală: ${totalDiscount.toFixed(2)} RON`);
        setTotalAfterDiscount(null);
    };

    const getTotal = () => {
        return cartItems.reduce((sum, item) =>
            sum + (item.price * item.quantity - (item.appliedDiscount || 0)), 0);
    };

    return (
        <div className="cart-container">
            <h2>🛒 Coșul tău</h2>
            {cartItems.length === 0 ? (
                <p>Coșul este gol.</p>
            ) : (
                <>
                    <ul>
                        {cartItems.map((item) => (
                            <li key={item.id}>
                                {item.name} - {item.price.toFixed(2)} RON × {item.quantity}
                                <br />
                                <label>
                                    <strong>Puncte de folosit (max. 500):</strong>{" "}
                                    <input
                                        type="number"
                                        disabled={item.pointsApplied}
                                        min="0"
                                        max={Math.min(500, availablePoints)}
                                        step="100"
                                        value={usedPoints[item.productId] || 0}
                                        onChange={(e) =>
                                            setUsedPoints(prev => ({
                                                ...prev,
                                                [item.productId]: Math.min(Number(e.target.value), 500)
                                            }))
                                        }
                                    />
                                </label>
                                {item.pointsApplied && (
                                    <span style={{ color: "orange", marginLeft: "10px" }}>
                                        ⚠️ Punctele au fost deja aplicate!
                                    </span>
                                )}
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>➕</button>
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>➖</button>
                                <button onClick={() => removeFromCart(item.id)} style={{ backgroundColor: "red", color: "white" }}>🗑️ Șterge</button>
                            </li>
                        ))}
                    </ul>

                    <p><strong>Total după reduceri:</strong> {getTotal().toFixed(2)} RON</p>

                    { }
                    <div className="cart-buttons">
                        <button onClick={handleApplyPoints} className="place-order-button">🎯 Aplică punctele</button>
                        <button onClick={() => navigate("/checkout")} className="place-order-button">🚀 Plasează comanda</button>
                    </div>

                </>
            )}
        </div>
    );
};

export default CartPage;
