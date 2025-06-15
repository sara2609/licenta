import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import "./MyOrdersPage.css";

const MyOrdersPage = () => {
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate              = useNavigate();
    const { theme }             = useContext(ThemeContext);

    /* ───────── FETCH ───────── */
    useEffect(() => {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email");

        if (!token || !email) {
            navigate("/login", { replace:true });
            return;
        }

        fetch(`http://localhost:8080/api/facturi/email/${email}`, {
            headers:{ Authorization:`Bearer ${token}` }
        })
            .then(r => {
                if (r.status === 401 || r.status === 403) throw new Error("401");
                if (!r.ok) throw new Error("err");
                return r.json();
            })
            .then(setOrders)
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
    }, [navigate]);

    /* ───────── UI ───────── */
    if (loading) return <p style={{textAlign:"center"}}>Se încarcă…</p>;

    return (
        <div className={`orders-container ${theme==="dark"?"dark":""}`}>
            <h2 className="orders-title">📦 Comenzile mele</h2>

            {orders.length === 0 ? (
                <p className="no-orders">Nu există comenzi înregistrate.</p>
            ) : (
                <ul className="orders-list">
                    {orders.map(o => (
                        <li key={o.id} className="order-card">
                            <span><strong>ID:</strong> {o.orderId}</span>
                            <span><strong>Data:</strong> {o.dataEmitere?.split("T")[0]}</span>
                            <span><strong>Total:</strong> {(+o.total).toFixed(2)} RON</span>
                            {o.rateSummary && <span className="rate-tag">{o.rateSummary}</span>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyOrdersPage;
