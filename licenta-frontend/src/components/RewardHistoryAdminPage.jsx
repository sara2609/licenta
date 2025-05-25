import React, { useEffect, useState } from "react";

const RewardHistoryAdminPage = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch("http://localhost:8080/admin/reward-history", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => setHistory(data))
            .catch(err => console.error("Eroare încărcare istoric:", err));
    }, []);

    return (
        <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>📊 Istoric puncte utilizatori</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr style={{ backgroundColor: "#f4f4f4" }}>
                    <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>Utilizator ID</th>
                    <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>Dată revendicare</th>
                    <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>Puncte</th>
                </tr>
                </thead>
                <tbody>
                {history.map((entry, index) => (
                    <tr key={index}>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{entry.userId}</td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{entry.claimedDate}</td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{entry.pointsAwarded}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default RewardHistoryAdminPage;
