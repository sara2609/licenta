import React, { useEffect, useState } from "react";

const ManageDiscountsPage = () => {
    const [products, setProducts] = useState([]);
    const [discounts, setDiscounts] = useState({});

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
        if (isNaN(value) || value <= 0) return alert("Introduceți o valoare validă!");

        const param = type === "procent" ? `procent=${value}` : `suma=${value}`;
        try {
            const response = await fetch(`http://localhost:8080/products/${id}/discount?${param}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (response.ok) {
                alert("✅ Reducere aplicată!");
                window.location.reload();
            } else {
                const error = await response.text();
                alert("❌ " + error);
            }
        } catch (err) {
            console.error("Eroare la aplicarea reducerii:", err);
            alert("❌ Eroare la aplicarea reducerii.");
        }
    };

    return (
        <div className="manage-discounts" style={{ padding: "30px" }}>
            <h2 style={{ marginBottom: "20px" }}>🔧 Admin - Reduceri produse</h2>
            {products.map(p => (
                <div key={p.id} style={{ border: "1px solid #ccc", padding: 15, marginBottom: 15, borderRadius: 8 }}>
                    <h4 style={{ marginBottom: 5 }}>{p.name}</h4>
                    <p style={{ marginBottom: 10 }}>Preț actual: <strong>{p.price.toFixed(2)} RON</strong></p>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Valoare reducere"
                        value={discounts[p.id] || ""}
                        onChange={(e) => setDiscounts({ ...discounts, [p.id]: e.target.value })}
                        style={{ marginRight: "10px", padding: "5px", width: "150px" }}
                    />
                    <button
                        onClick={() => applyDiscount(p.id, "procent")}
                        style={{ marginRight: 10, padding: "6px 12px", backgroundColor: "#2196F3", color: "#fff", border: "none", borderRadius: 5 }}
                    >
                        Reducere %
                    </button>
                    <button
                        onClick={() => applyDiscount(p.id, "suma")}
                        style={{ padding: "6px 12px", backgroundColor: "#4CAF50", color: "#fff", border: "none", borderRadius: 5 }}
                    >
                        Reducere sumă
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ManageDiscountsPage;
