// src/pages/SettingsPage.jsx
import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import "./SettingsPage.css";

const SettingsPage = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <div className="settings-container">
            <h2 className="settings-title">⚙️ Setări cont</h2>

            <p className="theme-status">
                🌗 Tema actuală: <strong>{theme}</strong>
            </p>

            <button className="theme-toggle-btn" onClick={toggleTheme}>
                🔁 Schimbă tema
            </button>
        </div>
    );
};

export default SettingsPage;
