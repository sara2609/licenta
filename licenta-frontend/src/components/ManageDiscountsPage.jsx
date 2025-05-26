import React, { useEffect, useState } from "react";
import "./ManageDiscountsPage.css";

const ManageDiscountsPage = () => {
    const [products, setProducts] = useState([]);
    const [discounts, setDiscounts] = useState({});
    const [durations, setDurations] = useState({});

    useEffect(() => {
        fetch("http://localhost:8080/products/in-stock", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then(res => res.json())
            .then(data => setProducts(data));
    }, []);

    const applyDiscount = async (id, type) => {
        const value = parseFloat(discounts[id]);
        const seconds = parseInt(durations[id]);

        if (isNaN(value) || value <= 0) {
            alert("⚠️ Introduceți o valoare validă pentru reducere!");
            return;
        }

        const param = type === "procent" ? `procent=${value}` : `suma=${value}`;
        const durationParam = !isNaN(seconds) && seconds > 0 ? `&duration=${seconds}` : "";

        const response = await fetch(`http://localhost:8080/products/${id}/discount?${param}${durationParam}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        const result = await response.text(); // folosim .text() în loc de .json()
        if (response.ok) {
            alert(result || "✅ Reducere aplicată!");
            window.location.reload();
        } else {
            alert("❌ " + result);
        }
    };

    const revertPrice = async (id) => {
        const response = await fetch(`http://localhost:8080/products/${id}/restore-price`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        const result = await response.text(); // tot aici e posibil să nu primești JSON
        if (response.ok) {
            alert(result || "🔁 Prețul a fost restaurat!");
            window.location.reload();
        } else {
            alert("❌ " + result);
        }
    };

    return (
        <div className="manage-discounts" style={{ padding: "20px" }}>
            <h2>🔧 Admin - Reduceri produse</h2>
            {products.map(p => (
                <div key={p.id} style={{ border: "1px solid #ccc", padding: 15, marginBottom: 10 }}>
                    <h4>{p.name}</h4>
                    <p>Preț actual: <strong>{p.price.toFixed(2)} RON</strong></p>

                    <input
                        type="number"
                        placeholder="Valoare reducere"
                        onChange={(e) => setDiscounts({ ...discounts, [p.id]: e.target.value })}
                        style={{ marginRight: "10px", padding: "5px" }}
                    />

                    <input
                        type="number"
                        placeholder="Durată (sec)"
                        onChange={(e) => setDurations({ ...durations, [p.id]: e.target.value })}
                        style={{ marginRight: "10px", padding: "5px" }}
                    />

                    <button onClick={() => applyDiscount(p.id, "procent")} style={{ marginRight: "5px" }}>
                        Reducere %
                    </button>
                    <button onClick={() => applyDiscount(p.id, "suma")} style={{ marginRight: "5px" }}>
                        Reducere sumă
                    </button>
                    <button onClick={() => revertPrice(p.id)} style={{ backgroundColor: "#d9534f", color: "white" }}>
                        🔁 Revino la prețul inițial
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ManageDiscountsPage;
