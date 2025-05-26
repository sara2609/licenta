import React, { useEffect, useState } from "react";

const AdminReturnRequestsPage = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8080/api/returns/all", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error("Eroare fetch");
                return res.json();
            })
            .then(data => setRequests(data))
            .catch(err => console.error("Eroare la preluarea retururilor:", err));
    }, []);

    const updateStatus = async (id, newStatus) => {
        const confirmed = window.confirm(`Sigur vrei să setezi statusul ca "${newStatus}"?`);
        if (!confirmed) return;

        const res = await fetch(`http://localhost:8080/api/returns/${id}/status?status=${newStatus}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (res.ok) {
            alert("✅ Status actualizat!");
            setRequests(prev =>
                prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
            );
        } else {
            alert("❌ Eroare la actualizare status.");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING": return "#ffcc00";
            case "APPROVED": return "#28a745";
            case "REJECTED": return "#dc3545";
            default: return "gray";
        }
    };

    return (
        <div style={{ padding: "30px" }}>
            <h2>📦 Cereri de retur primite</h2>

            {requests.length === 0 ? (
                <p>Nicio cerere momentan.</p>
            ) : (
                requests.map(req => (
                    <div key={req.id} style={{
                        border: "1px solid #ccc",
                        padding: "15px",
                        marginBottom: "15px",
                        borderLeft: `6px solid ${getStatusColor(req.status)}`
                    }}>
                        <p><strong>Nume:</strong> {req.name}</p>
                        <p><strong>Email:</strong> {req.email}</p>
                        <p><strong>Comandă:</strong> {req.orderId}</p>
                        <p><strong>Motiv:</strong> {req.reason}</p>
                        {req.details && <p><strong>Detalii:</strong> {req.details}</p>}
                        <p><strong>Status:</strong> <span style={{ color: getStatusColor(req.status), fontWeight: "bold" }}>{req.status}</span></p>

                        {req.status === "PENDING" && (
                            <div style={{ marginTop: "10px" }}>
                                <button
                                    onClick={() => updateStatus(req.id, "APPROVED")}
                                    style={{ marginRight: "10px", backgroundColor: "#28a745", color: "white", border: "none", padding: "6px 12px", borderRadius: "5px", cursor: "pointer" }}
                                >
                                    ✅ Acceptă
                                </button>
                                <button
                                    onClick={() => updateStatus(req.id, "REJECTED")}
                                    style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "6px 12px", borderRadius: "5px", cursor: "pointer" }}
                                >
                                    ❌ Refuză
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default AdminReturnRequestsPage;
