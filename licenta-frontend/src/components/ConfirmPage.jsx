import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const ConfirmPage = () => {
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState("Se verifică token-ul...");
    const token = searchParams.get("token");

    useEffect(() => {
        if (token) {
            axios.get(`http://localhost:8080/auth/confirm?token=${token}`)
                .then(() => {
                    setMessage("✅ Cont activat cu succes! Vei fi redirecționat către login...");
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 3000);
                })
                .catch(() => {
                    setMessage("✅ Contul a fost deja activat sau linkul a expirat.");
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 3000);
                });
        } else {
            setMessage("❌ Tokenul lipseste din URL.");
        }
    }, [token]);


    return (
        <div style={{ textAlign: "center", marginTop: "50px", fontSize: "24px" }}>
            {message}
        </div>
    );
};

export default ConfirmPage;
