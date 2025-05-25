import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";

const LoginForm = () => {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ identifier, password })
            });

            const result = await response.json();
            if (!response.ok) {
                setError(result);
                return;
            }

            localStorage.setItem("token", result.token);
            localStorage.setItem("role", result.role);
            localStorage.setItem("email", result.email);
            localStorage.setItem("username", result.username);
            localStorage.setItem("id", result.userId);
            localStorage.setItem("isGuest", "false");
            localStorage.removeItem("guest");

            navigate("/shop");
        } catch (err) {
            setError("❌ Eroare la conectare. Încearcă din nou.");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Login</h2>
                {error && <p className="error-message">{error}</p>}
                <input
                    type="text"
                    placeholder="Username sau Email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* LINK STILIZAT */}
                <p className="forgot-password" onClick={() => navigate("/forgot-password")}>
                    🔐 Forgot your password?
                </p>

                <button className="login-button" onClick={handleLogin}>
                    Log In
                </button>
                <p className="register-text">Not a member yet?</p>
                <button className="register-button" onClick={() => navigate("/register")}>
                    Register now
                </button>
                <button className="guest-button" onClick={() => {
                    localStorage.setItem("guest", "true");
                    navigate("/shop");
                }}>
                    👤 Continuă ca vizitator
                </button>
            </div>
        </div>
    );
};

export default LoginForm;
