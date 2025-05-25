import { useState } from "react";
import "./ResetPassword.css";

import { useNavigate, useSearchParams } from "react-router-dom";
import "./AuthPage.css";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState("");
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:8080/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword })
            });

            const text = await response.text();

            if (response.ok) {
                alert("✅ Parola a fost resetată cu succes!");
                navigate("/login");
            } else {
                alert("❌ " + text);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Eroare la resetarea parolei.");
        }
    };

    return (
        <div className="auth-container">
            <h2>🔑 Setează o parolă nouă</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="Parola nouă"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <button type="submit">Resetează parola</button>
            </form>
        </div>
    );
};

export default ResetPassword;
