import { useEffect, useState } from "react";

const AdminMatchingRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:8080/api/matching-price/pending", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setRequests(data);
        } catch (err) {
            console.error("❌ Eroare la fetch requests:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id) => {
        const token = localStorage.getItem("token");
        try {
            await fetch(`http://localhost:8080/api/matching-price/approve/${id}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("✅ Cerere aprobată");
            fetchRequests();
        } catch (err) {
            console.error("❌ Eroare aprobare:", err);
        }
    };

    const handleReject = async (id) => {
        const raspuns = prompt("Scrie motivul respingerii:");
        if (!raspuns) return;

        const token = localStorage.getItem("token");
        try {
            await fetch(`http://localhost:8080/api/matching-price/reject/${id}?response=${encodeURIComponent(raspuns)}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("❌ Cerere respinsă");
            fetchRequests();
        } catch (err) {
            console.error("❌ Eroare respingere:", err);
        }
    };

    if (loading) return <p>Se încarcă cererile...</p>;

    return (
        <div className="admin-matching-container">
            <h2>🔧 Cereri Matching Price</h2>
            {requests.length === 0 ? (
                <p>Nu există cereri în așteptare.</p>
            ) : (
                <table className="matching-table">
                    <thead>
                    <tr>
                        <th>User</th>
                        <th>Produs</th>
                        <th>Preț cerut</th>
                        <th>Mesaj</th>
                        <th>Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody>
                    {requests.map((req) => (
                        <tr key={req.id}>
                            <td>{req.user?.username}</td>
                            <td>{req.product?.name}</td>
                            <td>{req.requestedPrice} RON</td>
                            <td>{req.message}</td>
                            <td>
                                <button onClick={() => handleApprove(req.id)} style={{ marginRight: 8 }}>✅ Acceptă</button>
                                <button onClick={() => handleReject(req.id)}>❌ Respinge</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminMatchingRequestsPage;
