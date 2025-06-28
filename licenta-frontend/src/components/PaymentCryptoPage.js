
import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { CartContext } from "../context/CartContext";
import "./PaymentCryptoPage.css";

const PaymentCryptoPage = () => {
    const [selectedCoin, setSelectedCoin] = useState("BTC");
    const navigate = useNavigate();
    const { cartItems, setCartItems } = useContext(CartContext);
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);

    const walletAddresses = {
        BTC: "bc1qexamplebtcwallet12345",
        ETH: "0xexampleethereumwalletabcde",
        DOGE: "DExampleDogecoinWallet9876"
    };

    const handleConfirm = () => {
        const newOrder = {
            date: new Date().toISOString(),
            total,
            items: cartItems,
            paymentMethod: `Crypto - ${selectedCoin}`
        };

        const existing = JSON.parse(localStorage.getItem("myOrders")) || [];
        localStorage.setItem("myOrders", JSON.stringify([...existing, newOrder]));

        setCartItems([]);
        alert("✅ Plata cu criptomonedă a fost înregistrată!");
        navigate("/my-orders");
    };

    return (
        <div className="crypto-container">
            <h2>🪙 Alege criptomoneda</h2>
            <select value={selectedCoin} onChange={(e) => setSelectedCoin(e.target.value)}>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="DOGE">Dogecoin (DOGE)</option>
            </select>

            <div className="wallet-display">
                <p>Trimite exact suma la adresa:</p>
                <code>{walletAddresses[selectedCoin]}</code>
                <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${walletAddresses[selectedCoin]}&size=150x150`}
                    alt="QR Wallet"
                />
            </div>

            <button onClick={handleConfirm}>✅ Confirmă plata</button>
        </div>
    );
};

export default PaymentCryptoPage;
