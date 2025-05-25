import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import "./AuthPage.css";

const AuthPage = () => {
    const [showLogin, setShowLogin] = useState(true);

    return (
        <div className="auth-container">
            <div className="auth-box">
                {showLogin ? (
                    <>
                        <LoginForm onSwitch={() => setShowLogin(false)} />
                        <button className="guest-button" onClick={() => {
                            localStorage.setItem("guest", "true");
                            window.location.href = "/shop";
                        }}>
                            👤 Continuă ca vizitator
                        </button>
                    </>
                ) : (
                    <RegisterForm onSwitch={() => setShowLogin(true)} />
                )}
            </div>
        </div>
    );
};

export default AuthPage;
