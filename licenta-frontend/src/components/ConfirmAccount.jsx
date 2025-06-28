
import React, { useEffect, useState } from 'react';

const ConfirmAccount = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get('token');

        if (token) {
            fetch(`http://localhost:8080/auth/confirm?token=${token}`)
                .then(res => res.text())
                .then(data => setMessage(data))
                .catch(() => setMessage("❌ Eroare la confirmarea contului."));
        } else {
            setMessage("❌ Token lipsă în URL.");
        }
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Confirmare cont</h2>
            <p>{message}</p>
        </div>
    );
};

export default ConfirmAccount;
