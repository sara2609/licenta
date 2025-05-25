import React, { useState, useEffect } from "react";
import "./AdminReplyPage.css";

const AdminReplyPage = () => {
    const [messages, setMessages] = useState([]);
    const [replyContent, setReplyContent] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:8080/messages/all", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Eroare la aducerea mesajelor!");
                }

                const data = await response.json();
                setMessages(data);
                setLoading(false);
            } catch (err) {
                console.error("Eroare la încărcarea mesajelor:", err);
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    const handleReplyChange = (id, value) => {
        setReplyContent(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSendReply = async (messageId) => {
        const reply = replyContent[messageId];

        if (!reply) {
            alert("✋ Introdu un răspuns înainte de a trimite!");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/messages/reply/${messageId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(reply)
            });

            if (response.ok) {
                alert("✅ Răspuns trimis cu succes!");
                window.location.reload();
            } else {
                alert("❌ Eroare la trimiterea răspunsului!");
            }
        } catch (error) {
            console.error("Eroare la trimitere:", error);
            alert("❌ Eroare la trimiterea răspunsului!");
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="admin-reply-container">
            <h2>📬 Mesaje primite</h2>
            {messages.length === 0 ? (
                <p>Nu există mesaje.</p>
            ) : (
                messages.map((msg) => {
                    const messageId = msg.id || msg.idmessage || msg.idMessage; // 🔥 asigurăm ID-ul corect

                    return (
                        <div key={messageId} className="message-card">
                            <p><strong>De la:</strong> {msg.senderEmail}</p>
                            <p><strong>Mesaj:</strong> {msg.content}</p>
                            <p><strong>Data:</strong> {msg.createdAt ? msg.createdAt.replace("T", " ").substring(0, 19) : "N/A"}</p>

                            {msg.adminReply ? (
                                <p className="already-replied"><strong>Răspuns trimis:</strong> {msg.adminReply}</p>
                            ) : (
                                <div className="reply-form">
                                    <textarea
                                        placeholder="Scrie răspunsul aici..."
                                        value={replyContent[messageId] || ""}
                                        onChange={(e) => handleReplyChange(messageId, e.target.value)}
                                    />
                                    <button onClick={() => handleSendReply(messageId)}>✉️ Trimite răspuns</button>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default AdminReplyPage;
