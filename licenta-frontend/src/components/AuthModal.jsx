import React from "react";
import "./AuthModal.css";

export default function AuthModal({ onContinue, onRegister, onClose }) {
    React.useEffect(() => {
        const esc = e => e.key === "Escape" && onClose();
        document.addEventListener("keydown", esc);
        return () => document.removeEventListener("keydown", esc);
    }, [onClose]);
    return (
        <div className="auth-backdrop" onClick={onClose}>
            <div
                className="auth-modal"
                onClick={e => e.stopPropagation()}
            >
                <h2>🔐 Trebuie să fii autentificat</h2>
                <p>Alege una dintre opțiuni:</p>

                <div className="auth-buttons">
                    <button className="btn-secondary" onClick={onContinue}>
                        Continuă neautentificat
                    </button>
                    <button className="btn-primary" onClick={onRegister}>
                        Înregistrează-te
                    </button>
                </div>
            </div>
        </div>
    );
}
