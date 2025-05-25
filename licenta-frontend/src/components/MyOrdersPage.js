import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext"; // ✅ Importă contextul temei
import "./MyOrdersPage.css";

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext); // ✅ Preia tema curentă

    useEffect(() => {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email");

        if (!token || !email) {
            alert("❌ Trebuie să fii logat pentru a vedea comenzile tale.");
            navigate("/login");
            return;
        }

        fetch(`http://localhost:8080/api/facturi/email/${email}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Eroare la încărcarea comenzilor");
                return res.json();
            })
            .then(data => {
                const transformed = data.map(factura => ({
                    id: factura.id,
                    date: factura.dataEmitere,
                    items: [
                        {
                            name: factura.clientName,
                            price: parseFloat(factura.total)
                        }
                    ],
                    total: parseFloat(factura.total)
                }));
                setOrders(transformed);
            })
            .catch(err => {
                console.error(err);
                alert("❌ Eroare la încărcarea comenzilor");
            });
    }, [navigate]);

    return (
        <div className={`orders-container ${theme === "dark" ? "dark" : ""}`}>
            <h2 className={theme === "dark" ? "dark-title" : ""}>📦 Comenzile tale</h2>
            {orders.length === 0 ? (
                <p>Nu ai nicio comandă momentan.</p>
            ) : (
                orders.map(order => (
                    <div className="order-card" key={order.id}>
                        <h4>Comandă #{order.id}</h4>
                        <p><strong>Data:</strong> {new Date(order.date).toLocaleString()}</p>
                        <ul>
                            {order.items.map((item, i) => (
                                <li key={i}>
                                    {item.name} - {item.price.toFixed(2)} RON
                                </li>
                            ))}
                        </ul>
                        <p><strong>Total:</strong> {order.total.toFixed(2)} RON</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default MyOrdersPage;
