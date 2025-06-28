import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import "./FidelityCard.css";

const FidelityCard = () => {
    const { id } = useParams();
    const { theme } = useContext(ThemeContext);
    const [data, setData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch("http://localhost:8080/fidelity", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.ok ? res.json() : null)
            .then(setData)
            .catch(err => console.error("Eroare fidelitate:", err));
    }, []);

    if (!data) return <p className="loading-text">Se încarcă cardul tău de fidelitate...</p>;

    const codClient = `#U${String(data.userId).padStart(5, "0")}`;
    const reducere = data.fidelityPoints >= 2000 ? "20%" : data.fidelityPoints >= 1000 ? "10%" : "0%";

    return (
        <div className={`fidelity-container ${theme === "dark" ? "dark" : ""}`}> {}
            <h2>🎫 Card digital de fidelitate</h2>
            <div className="fidelity-card">
                <p><strong>Nume:</strong> {data.username}</p>

                <p>
                    <strong>
                        <Link
                            to="/daily-reward"
                            style={{
                                color: "#ff69b4",
                                textDecoration: "none",
                                fontWeight: "bold",
                                cursor: "pointer"
                            }}
                            title="Click pentru a vedea istoricul și revendicarea punctelor"
                        >
                            💎 Puncte:
                        </Link>
                    </strong>{" "}
                    {data.fidelityPoints}
                </p>

                <p>
                    <strong>Cod client:</strong>{" "}
                    <span style={{ fontFamily: "monospace", color: "#007BFF" }}>{codClient}</span>
                </p>

                <p><strong>Reducere actuală:</strong> {reducere}</p>
            </div>
        </div>
    );
};

export default FidelityCard;
