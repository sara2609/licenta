import React, { useEffect, useState } from "react";

const DailyRewardPage = () => {
    const [reward, setReward] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchReward = async () => {
        const token = localStorage.getItem("token");

        try {
            const res = await fetch("http://localhost:8080/api/rewards/status", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setReward(data);
            } else {
                setMessage("❌ Nu s-au putut încărca datele.");
            }
        } catch (error) {
            setMessage("❌ Eroare la conectare.");
        }

        setLoading(false);
    };

    const claimPoints = async () => {
        const token = localStorage.getItem("token");

        try {
            const res = await fetch("http://localhost:8080/api/rewards/claim", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setMessage("✅ Punctele au fost revendicate!");
                fetchReward();
            } else {
                const text = await res.text();
                setMessage("❌ " + text);
            }
        } catch (error) {
            setMessage("❌ Eroare la revendicare.");
        }
    };

    useEffect(() => {
        fetchReward();
    }, []);

    return (
        <div style={{
            maxWidth: "600px",
            margin: "50px auto",
            padding: "30px",
            borderRadius: "12px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>🏆 Punctele tale</h2>

            {loading ? (
                <p style={{ textAlign: "center" }}>Se încarcă datele...</p>
            ) : reward ? (
                <div style={{ textAlign: "center", fontSize: "1.1rem" }}>
                    <p><strong>Total puncte:</strong> {reward.totalPoints}</p>
                    <p><strong>Streak curent:</strong> {reward.currentStreak} zile</p>
                    <p><strong>Ultima revendicare:</strong> {reward.lastClaimedDate}</p>

                    <button
                        onClick={claimPoints}
                        style={{
                            marginTop: "20px",
                            padding: "10px 20px",
                            backgroundColor: "#ff69b4",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        ✅ Revendică punctele de azi
                    </button>

                    {message && <p style={{ marginTop: "15px", color: "green" }}>{message}</p>}
                </div>
            ) : (
                <p style={{ color: "red", textAlign: "center" }}>{message}</p>
            )}
        </div>
    );
};

export default DailyRewardPage;
