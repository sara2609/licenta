import { useEffect, useState } from "react";
import "./UpdateStockPage.css";

const UpdateStockPage = () => {
    const [products, setProducts] = useState([]);
    const [stockUpdates, setStockUpdates] = useState({});

    useEffect(() => {
        const fetchProducts = async () => {
            const token = localStorage.getItem("token");

            const res = await fetch("http://localhost:8080/products", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        };

        fetchProducts();
    }, []);

    const handleStockChange = (id, value) => {
        setStockUpdates((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleSave = async (id) => {
        const token = localStorage.getItem("token");
        const newStock = stockUpdates[id];

        if (newStock === undefined || newStock === "") return;

        const res = await fetch(
            `http://localhost:8080/products/${id}/stock?stock=${newStock}`,
            {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (res.ok) {
            alert("✅ Stoc actualizat!");
            window.location.reload();
        } else {
            alert("❌ Eroare la actualizare!");
        }
    };

    return (
        <div
            className="stock-container"
            style={{
                padding: "30px",
                maxWidth: "800px",
                margin: "0 auto",
                borderRadius: "8px",
            }}
        >
            <h2
                style={{
                    textAlign: "center",
                    marginBottom: "30px",
                }}
            >
                📦 Actualizează stocul produselor
            </h2>

            {products.map((p) => (
                <div
                    key={p.id}
                    style={{
                        marginBottom: "30px",
                        padding: "15px",
                        borderBottom: "1px solid #ccc",
                    }}
                >
                    <h4 style={{ marginBottom: "5px" }}>{p.name}</h4>
                    <p style={{ margin: "5px 0" }}>
                        Stoc curent: <strong>{p.stock}</strong>
                    </p>
                    <input
                        type="number"
                        placeholder="Stoc nou"
                        value={stockUpdates[p.id] || ""}
                        onChange={(e) => handleStockChange(p.id, e.target.value)}
                        style={{ marginRight: "10px", padding: "5px" }}
                    />
                    <button onClick={() => handleSave(p.id)} style={{ padding: "6px 15px" }}>
                        Salvează
                    </button>
                </div>
            ))}
        </div>
    );
};

export default UpdateStockPage;
