import React from "react";
import "./InformatiiPage.css";

const InformatiiPage = () => {
    return (
        <div className="informatii-container">
            <h1>ℹ️ Informații utile</h1>
            <p>👋 Bun venit pe platforma noastră! Suntem bucuroși că ai ajuns la noi.</p>

            <h2>📧 Contact suport</h2>
            <p>Email: <strong>support@ss-shop.ro</strong></p>
            <p>Telefon: <strong>+40 745 123 456</strong></p>

            <h2>🏢 Adresă sediu</h2>
            <p>Str. Exemplului 123, Sector 1, București</p>

            <h2>🕘 Program</h2>
            <p>Luni - Vineri: 09:00 - 17:00</p>
            <p>Sâmbătă - Duminică: Închis</p>

            <h2>💬 Alte detalii</h2>
            <p>
                Dacă ai întrebări, sugestii sau reclamații, echipa noastră este disponibilă pe email și telefon.
                Îți mulțumim că faci parte din comunitatea noastră! ❤️
            </p>
        </div>
    );
};

export default InformatiiPage;
