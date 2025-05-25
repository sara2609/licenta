import React, { useState, useEffect } from "react";
import "./ChatWidget.css";

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const guest = localStorage.getItem("guest");
        if (token && guest !== "true") {
            setIsLoggedIn(true);
            const savedEmail = localStorage.getItem("email");
            if (savedEmail) {
                setEmail(savedEmail);
            }
        }
    }, []);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message || (!email && !isLoggedIn)) {
            alert("✋ Te rog completează toate câmpurile!");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:8080/messages/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    senderEmail: email,
                    content: message
                })
            });

            const data = await response.text();

            if (response.ok) {
                alert("✅ Mesaj trimis cu succes!");
                setMessage("");
                if (!isLoggedIn) setEmail("");
            } else {
                alert("❌ Eroare: " + data);
            }
        } catch (error) {
            console.error(error);
            alert("❌ Eroare la trimiterea mesajului.");
        }
    };

    return (
        <div className="chat-widget-container">
            {isOpen ? (
                <div className="chat-box">
                    <button className="close-chat" onClick={toggleChat}>✖️</button>
                    <h3>💬 Trimite un mesaj</h3>
                    <form onSubmit={handleSubmit}>
                        {!isLoggedIn && (
                            <input
                                type="email"
                                placeholder="Emailul tău"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        )}
                        <textarea
                            placeholder="Mesajul tău"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        />
                        <button type="submit">📨 Trimite</button>
                    </form>
                </div>
            ) : (
                <button className="open-chat" onClick={toggleChat}>
                    💬 Asistență
                </button>
            )}
        </div>
    );
};

export default ChatWidget;
