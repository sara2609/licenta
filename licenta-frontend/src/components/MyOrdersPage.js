import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import "./MyOrdersPage.css";

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email");

        if (!token || !email) {
            navigate("/login", { replace: true });  // 🔄 doar redirect silențios
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
                    items: [{ name: factura.clientName, price: parseFloat(factura.total) }],
                    total: parseFloat(factura.total),
                    rate: factura.rateSummary || null
                }));
                setOrders(transformed);
            })
            .catch(err => {
                console.error(err);
                alert("❌ Eroare la încărcarea comenzilor");
            });
    }, [navigate]);

    /* ... restul codului neschimbat ... */
};

export default MyOrdersPage;
