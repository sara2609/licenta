import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:8080/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const text = await response.text();

            if (response.ok) {
                alert("✅ Linkul de resetare a fost trimis către email!");
                navigate("/login");
            } else {
                alert("❌ " + text);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Eroare la trimiterea cererii de resetare.");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>🔐 Resetare parolă</h2>
                <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                    <input
                        type="email"
                        placeholder="Emailul tău"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit" className="login-button">
                        Trimite linkul de resetare
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
