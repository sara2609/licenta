import React, { useEffect, useState } from "react";

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [banReasons, setBanReasons] = useState({});

    const fetchUsers = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Nu ești autentificat!");
            return;
        }

        const res = await fetch("http://localhost:8080/admin/users", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const status = res.status;
        const text = await res.text();

        console.log("Status:", status);
        console.log("Text:", text);

        if (status === 403 || status === 401) {
            alert("Acces interzis. Nu ai drepturi de admin sau tokenul e invalid.");
            return;
        }

        if (!text) {
            setUsers([]);
        } else {
            const data = JSON.parse(text);
            setUsers(data);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleBanUser = async (userId) => {
        const reason = banReasons[userId];
        if (!reason) {
            alert("Introdu un motiv pentru ban!");
            return;
        }

        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8080/admin/ban-user/${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ reason })
        });

        if (res.ok) {
            alert("✅ User banat cu succes!");
            fetchUsers();
        } else {
            alert("❌ Eroare la banare!");
        }
    };

    const handleUnban = async (userId) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8080/admin/unban/${userId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            alert("✅ User deblocat!");
            fetchUsers();
        } else {
            alert("❌ Eroare la deblocare!");
        }
    };

    return (
        <div>
            <h2>👑 Admin - Gestionare Utilizatori</h2>
            {users.map((u) => (
                <div key={u.userId} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
                    <p><strong>{u.username}</strong> ({u.email})</p>
                    <p>Rol: {u.role} | Activat: {u.enabled ? "Da" : "Nu"} | Banat: {u.banned ? "Da" : "Nu"}</p>

                    {u.banned ? (
                        <>
                            <p style={{ color: "red" }}>Motiv ban: {u.banReason}</p>
                            <button onClick={() => handleUnban(u.userId)}>🔓 Deblochează</button>
                        </>
                    ) : (
                        <div>
                            <input
                                placeholder="Motiv ban..."
                                value={banReasons[u.userId] || ""}
                                onChange={(e) =>
                                    setBanReasons({ ...banReasons, [u.userId]: e.target.value })
                                }
                            />
                            <button onClick={() => handleBanUser(u.userId)}>🚫 Banează</button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AdminUsersPage;
