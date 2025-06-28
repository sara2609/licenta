import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ThemeContext } from "../context/ThemeContext";
import "./AccountPage.css";


const AccountPage = () => {

    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);

    const [userInfo, setUserInfo]      = useState(null);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showChangeForm, setShowChangeForm] = useState(false);
    const [lowStockProducts, setLowStockProducts] = useState([]);


    useEffect(() => {
        const token   = localStorage.getItem("token");
        const isGuest = localStorage.getItem("isGuest") === "true";


        if (!token || isGuest) return;

        try {
            const decoded = jwtDecode(token);
            setUserInfo(decoded);

            if (decoded.role === "ADMIN") {
                fetch("http://localhost:8080/products/low-stock", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then((res) => res.json())
                    .then(setLowStockProducts)
                    .catch((err) => console.error("Eroare stocuri mici:", err));
            }
        } catch {

            localStorage.removeItem("token");
            navigate("/login", { replace: true });
        }
    }, [navigate]);


    const handleLogout = () => {
        localStorage.clear();
        navigate("/login", { replace: true });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            alert("Noua parolă trebuie să aibă minim 6 caractere.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            if (response.ok) {
                alert("✅ Parola schimbată cu succes!");
                localStorage.clear();
                navigate("/login", { replace: true });
            } else {
                const text = await response.text();
                alert("❌ Eroare: " + text);
            }
        } catch {
            alert("❌ Eroare rețea");
        }
    };


    return (
        <div className={`account-container center-content ${theme}`}>
            <h2 className={`account-title ${theme}`}>👤 Pagina contului</h2>

            {userInfo ? (

                <div className="account-info">
                    <p>
                        <strong>Username sau email:</strong> {userInfo.sub}
                    </p>

                    <button className="logout-button" onClick={handleLogout}>
                        🚪 Log Out
                    </button>

                    {!showChangeForm ? (
                        <button
                            className="change-password-button"
                            onClick={() => setShowChangeForm(true)}
                        >
                            🔑 Schimbă parola
                        </button>
                    ) : (
                        <form className="change-password" onSubmit={handlePasswordSubmit}>
                            <input
                                type="password"
                                placeholder="Parola veche"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Parola nouă (min. 6)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button type="submit">Actualizează parola</button>
                        </form>
                    )}

                    {userInfo.role === "ADMIN" && lowStockProducts.length > 0 && (
                        <div className="low-stock-box">
                            <h4>⚠️ Produse cu stoc redus</h4>
                            <ul>
                                {lowStockProducts.map((p) => (
                                    <li key={p.id}>
                                        {p.name} — <strong>{p.stock} buc.</strong>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : (

                <p className="guest-message">
                    Nu ești autentificat. Poți continua să navighezi, dar pentru a vedea
                    detaliile contului trebuie să te
                    <button className="inline-link" onClick={() => navigate("/login")}> conectezi</button>.
                </p>
            )}
        </div>
    );
};

export default AccountPage;
