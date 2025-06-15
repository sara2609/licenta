import React, { useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";   // ← adăugat
import "./ReturnPage.css";

const ReturnPage = () => {
    const { theme } = useContext(ThemeContext);             // ← adăugat

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        orderId: "",
        reason: "",
        details: "",
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:8080/api/returns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) setSubmitted(true);
            else alert("❌ Eroare la trimiterea cererii de retur.");
        } catch (err) {
            console.error(err);
            alert("❌ Eroare de rețea sau server.");
        }
    };

    return (
        <div className={`return-container ${theme === "dark" ? "dark" : ""}`}>
            <h2>🔄 Cerere de retur</h2>

            <p>
                Ai la dispoziție <strong>14 zile</strong> pentru a returna un produs.
                Acesta trebuie să fie în stare bună, nefolosit și în ambalajul original.
            </p>
            <p>
                <strong>Nu se acceptă retururi</strong> pentru produse software,
                vouchere sau produse personalizate.
            </p>

            {!submitted ? (
                <form className="return-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Nume complet"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="orderId"
                        placeholder="Număr comandă"
                        value={formData.orderId}
                        onChange={handleChange}
                        required
                    />
                    <select
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Alege motivul returului</option>
                        <option value="defect">Produs defect</option>
                        <option value="altul">Am primit alt produs</option>
                        <option value="nu-imiplace">Nu corespunde așteptărilor</option>
                        <option value="alt-motiv">Alt motiv</option>
                    </select>
                    <textarea
                        name="details"
                        placeholder="Detalii suplimentare (opțional)"
                        value={formData.details}
                        onChange={handleChange}
                    />
                    <button type="submit">📤 Trimite cererea</button>
                </form>
            ) : (
                <div className="success-message">
                    ✅ Cererea ta de retur a fost trimisă! Te vom contacta în curând prin
                    email.
                </div>
            )}
        </div>
    );
};

export default ReturnPage;
