import { useState } from "react";
import QrReader from "react-qr-reader";

const QRCodeScanner = () => {
    const [result, setResult] = useState(null);
    const [showScanner, setShowScanner] = useState(false);

    const handleScan = (data) => {
        if (data) {
            // Extrage datele din URL (ex: ?name=...&points=...&exp=...)
            const urlParams = new URLSearchParams(data.split("?")[1]);
            const name = urlParams.get("name");
            const points = urlParams.get("points");
            const exp = urlParams.get("exp");

            const output = `Nume: ${name}\nPuncte: ${points}\nExpiră la: ${exp}`;
            setResult(output);
            setShowScanner(false);
        }
    };

    const handleError = (err) => {
        console.error("Eroare scanare QR:", err);
    };

    return (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
            <button onClick={() => setShowScanner(!showScanner)}>
                {showScanner ? "Închide scannerul" : "Scanează cod QR"}
            </button>

            {showScanner && (
                <div style={{ marginTop: "20px" }}>
                    <QrReader
                        delay={300}
                        onError={handleError}
                        onScan={handleScan}
                        style={{ width: "300px" }}
                    />
                </div>
            )}

            {result && (
                <div style={{ marginTop: "20px" }}>
                    <h4>📦 Cod scanat:</h4>
                    <pre>{result}</pre>
                </div>
            )}
        </div>
    );
};

export default QRCodeScanner;
