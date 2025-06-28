
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import "./PaymentCardPage.css";

const PaymentCardPage = () => {
    const navigate = useNavigate();
    const { cartItems, setCartItems } = useContext(CartContext);
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);

    const handlePayment = (e) => {
        e.preventDefault();

        const newOrder = {
            date: new Date().toISOString(),
            total,
            items: cartItems,
            paymentMethod: "Card bancar"
        };

        const existing = JSON.parse(localStorage.getItem("myOrders")) || [];
        localStorage.setItem("myOrders", JSON.stringify([...existing, newOrder]));

        setCartItems([]);
        alert("✅ Plata cu cardul a fost efectuată!");
        navigate("/my-orders");
    };

    return (
        <div className="payment-container">
            <h2>💳 Plata cu cardul</h2>
            <form className="payment-form" onSubmit={handlePayment}>
                <input type="text" placeholder="Nume deținător" required />
                <input type="text" placeholder="Număr card (ex: 4242 4242 4242 4242)" required />
                <input type="text" placeholder="Data expirare (MM/YY)" required />
                <input type="text" placeholder="CVV" required />
                <button type="submit">Plătește acum</button>
            </form>
        </div>
    );
};

export default PaymentCardPage;
