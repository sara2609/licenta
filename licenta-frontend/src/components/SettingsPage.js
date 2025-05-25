import { useContext, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import "./SettingsPage.css";

const SettingsPage = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const guest = localStorage.getItem("guest");

        // Dacă nu există token (deci nu e user logat) => redirect
        if (!token || guest) {
            navigate("/login");
        }
    }, [navigate]);

    return (
        <div className="settings-container">
            <h2>⚙️ Setări cont</h2>
            <p>🌗 Tema actuală: <strong>{theme}</strong></p>
            <button className="theme-button" onClick={toggleTheme}>🔁 Schimbă tema</button>
        </div>
    );
};

export default SettingsPage;
