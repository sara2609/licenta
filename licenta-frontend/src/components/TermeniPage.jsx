import React from "react";
import "./TermeniPage.css";

const TermeniPage = () => {
    return (
        <div className="termeni-container">
            <h1>Termeni și Condiții</h1>
            <p>
                Prin utilizarea acestui site, ești de acord cu termenii și condițiile impuse de compania noastră.
                Te rugăm să citești cu atenție toți pașii de mai jos:
            </p>

            <h2>1. Date personale</h2>
            <p>
                Informațiile tale sunt prelucrate în conformitate cu legislația GDPR. Nu vindem sau partajăm
                datele tale cu terți fără consimțământul tău.
            </p>

            <h2>2. Comenzi</h2>
            <p>
                Odată ce ai plasat o comandă, vei primi un e-mail de confirmare. Ne rezervăm dreptul de a refuza
                comenzile dacă există suspiciuni de fraudă.
            </p>

            <h2>3. Returnări</h2>
            <p>
                Ai dreptul să returnezi produsele în termen de 14 zile calendaristice, fără a fi nevoie de un motiv.
            </p>

            <h2>4. Modificări</h2>
            <p>
                Ne rezervăm dreptul de a modifica acești termeni oricând. Modificările vor fi afișate pe această pagină.
            </p>

            <p style={{ marginTop: "30px" }}>
                Pentru întrebări, ne poți contacta la <strong>support@siteulmeu.ro</strong>.
            </p>
        </div>
    );
};

export default TermeniPage;
