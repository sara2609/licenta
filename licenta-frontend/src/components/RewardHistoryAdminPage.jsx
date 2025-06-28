import React, { useEffect, useState } from "react";
import "./RewardHistoryAdminPage.css";

const RewardHistoryAdminPage = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch("http://localhost:8080/admin/reward-history", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => setHistory(data))
            .catch((err) => console.error("Eroare încărcare istoric:", err));
    }, []);

    return (
        <div className="reward-history-container">
            {}
            <h2>📊 Istoric puncte utilizatori</h2>
            <table>
                <thead>
                <tr>
                    <th>Utilizator ID</th>
                    <th>Dată revendicare</th>
                    <th>Puncte</th>
                </tr>
                </thead>
                <tbody>
                {history.map((entry, index) => (
                    <tr key={index}>
                        <td>{entry.userId}</td>
                        <td>{entry.claimedDate}</td>
                        <td>{entry.pointsAwarded}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default RewardHistoryAdminPage;
