import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CampaniiPage = () => {
    const userId = localStorage.getItem("userId") || 1;

    const [reward, setReward] = useState({
        lastClaimedDate: '2024-05-01',
        currentStreak: 5,
        totalPoints: 100
    });

    const [message, setMessage] = useState('');

    useEffect(() => {
        axios.get(`/api/rewards/status/${userId}`)
            .then(res => {
                if (res.data && Object.keys(res.data).length > 0) {
                    setReward(res.data);
                } else {
                    console.warn("⚠️ Nu s-au primit date valide, se păstrează valorile default.");
                }
            })
            .catch(err => {
                console.error("❌ Eroare GET:", err);
            });
    }, [userId]);

    const claimReward = () => {
        axios.post(`/api/rewards/claim/${userId}`)
            .then(res => {
                if (res.data && Object.keys(res.data).length > 0) {
                    setReward(res.data);
                    setMessage(`✅ Ai revendicat ${res.data.currentStreak} puncte! Total: ${res.data.totalPoints}`);
                } else {
                    console.warn("⚠️ Nu s-au primit date noi după POST.");
                }
            })
            .catch(err => {
                console.error("❌ Eroare POST:", err);
            });
    };

    return (
        <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px", fontFamily: "Arial" }}>
            <h2 style={{ textAlign: "center" }}>🏆 Punctele tale</h2>

            {reward ? (
                <div style={{ textAlign: "center", border: "1px solid #ccc", borderRadius: "8px", padding: "20px" }}>
                    <p><strong>Total puncte:</strong> {reward.totalPoints}</p>
                    <p><strong>Streak curent:</strong> {reward.currentStreak} zile</p>
                    <p><strong>Ultima revendicare:</strong> {reward.lastClaimedDate}</p>

                    <button
                        onClick={claimReward}
                        style={{
                            marginTop: "10px",
                            padding: "10px 20px",
                            background: "#ff69b4",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer"
                        }}
                    >
                        ✅ Revendică punctele de azi
                    </button>

                    {message && <p style={{ color: "green", marginTop: "10px" }}>{message}</p>}
                </div>
            ) : (
                <p style={{ textAlign: "center" }}>Se încarcă datele...</p>
            )}
        </div>
    );
};

export default CampaniiPage;
