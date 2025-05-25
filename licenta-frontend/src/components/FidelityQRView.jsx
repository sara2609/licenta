import { useSearchParams } from "react-router-dom";

const FidelityQRView = () => {
    const [params] = useSearchParams();
    const name = params.get("name");
    const points = params.get("points");
    const exp = params.get("exp");

    return (
        <div style={{ padding: "30px", textAlign: "center" }}>
            <h2>🎫 Detalii Card Fidelitate</h2>
            <p><strong>Nume:</strong> {name}</p>
            <p><strong>Puncte:</strong> {points}</p>
            <p><strong>Expiră la:</strong> {exp}</p>
        </div>
    );
};

export default FidelityQRView;
