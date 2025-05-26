import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [accepted, setAccepted] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!accepted) return setMessage("⚠️ Trebuie să accepți termenii.");

        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return setMessage("❌ Email invalid!");
        }

        setLoading(true);
        try {
            const res = await fetch("http://localhost:8080/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.text();
            setMessage(data);
        } catch {
            setMessage("❌ Eroare la conectarea cu serverul!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Register</h2>
                <form onSubmit={handleRegister}>
                    <input type="text" name="username" placeholder="Username" autoComplete="off" value={formData.username} onChange={handleChange} />
                    <input type="email" name="email" placeholder="Email Address" autoComplete="off" value={formData.email} onChange={handleChange} />
                    <input type="password" name="password" placeholder="Password" autoComplete="new-password" value={formData.password} onChange={handleChange} />

                    <div className="checkbox-row">
                        <input type="checkbox" id="terms" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                        <label htmlFor="terms">
                            Accept <a href="/termeni" target="_blank" rel="noreferrer" style={{ color: "#007bff" }}>termenii și condițiile</a>
                        </label>
                    </div>

                    <button type="submit" className="register-button" disabled={!accepted || loading} style={{ opacity: accepted ? 1 : 0.5 }}>
                        {loading ? "Se înregistrează..." : "Register"}
                    </button>
                </form>

                {message && <p style={{ marginTop: "10px", color: "#333", fontSize: "0.9em" }}>{message}</p>}
                <p className="switch-link">
                    Ai deja cont?{" "}
                    <button className="switch-link" onClick={() => navigate("/login")}>Login</button>
                </p>
            </div>
        </div>
    );
};

export default RegisterForm;