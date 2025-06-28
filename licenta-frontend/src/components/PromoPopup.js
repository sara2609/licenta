
import { useEffect, useState } from "react";
import "./PromoPopup.css";

const PromoPopup = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem("welcomePromoShown");
        if (!hasSeen) {
            setTimeout(() => {
                setVisible(true);
                localStorage.setItem("welcomePromoShown", "true");
            }, 800); // delay ca să nu apară brusc
        }
    }, []);

    if (!visible) return null;

    return (
        <div className="promo-popup">
            <div className="promo-content">
                <h3>🎁 10% reducere la prima comandă!</h3>
                <p>Folosește codul <strong>WELCOME10</strong> la checkout.</p>
                <button onClick={() => setVisible(false)}>Închide</button>
            </div>
        </div>
    );
};

export default PromoPopup;
