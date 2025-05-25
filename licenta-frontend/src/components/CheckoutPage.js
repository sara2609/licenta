import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import StripeCheckoutPage from "./StripeCheckoutPage";
import "./CheckoutPage.css";

const CheckoutPage = () => {
    const { cartItems, clearCart } = useContext(CartContext);
    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "", phone: "",
        address: "", city: "", county: "", zip: "",
        country: "România", delivery: "curier", easyboxCode: "",
        payment: "cash", coupon: ""
    });

    const [showStripe, setShowStripe] = useState(false);
    const [finalTotal, setFinalTotal] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const localTotal = cartItems.reduce((sum, item) => {
        const discount = item.appliedDiscount || 0;
        const itemTotal = item.price * item.quantity - discount;
        return sum + itemTotal;
    }, 0);

    const totalToDisplay = Number(finalTotal ?? localTotal ?? 0); // 👈 Evită crash-ul .toFixed()

    const handleSubmit = async (e) => {
        e.preventDefault();
        const orderId = "ORD-" + Date.now();
        const token = localStorage.getItem("token");

        try {
            const checkoutRes = await fetch("http://localhost:8080/cart/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (!checkoutRes.ok) {
                const errText = await checkoutRes.text();
                alert("❌ Eroare la procesarea comenzii: " + errText);
                return;
            }

            const { total: totalFromServer } = await checkoutRes.json();
            setFinalTotal(Number(totalFromServer)); // 👈 Convertim la număr

            const comanda = {
                orderId,
                numeClient: `${formData.firstName} ${formData.lastName}`,
                emailClient: formData.email,
                total: totalFromServer,
                couponCode: formData.coupon,
                products: cartItems.map(item => ({
                    name: item.name,
                    price: item.price.toFixed(2),
                    qty: item.quantity
                }))
            };

            const facturaRes = await fetch("http://localhost:8080/api/facturi/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(comanda)
            });

            if (!facturaRes.ok) throw new Error("❌ Eroare la generarea facturii.");

            clearCart();
            alert("✅ Comanda plasată și factura trimisă pe email!");
            localStorage.setItem("email", formData.email);
            navigate("/my-orders");
        } catch (err) {
            console.error(err);
            alert("❌ Eroare la conectarea cu serverul!");
        }
    };

    return (
        <div className="checkout-container">
            <h2>📟 Detalii de facturare</h2>
            <form onSubmit={handleSubmit} className="checkout-form">
                <input name="firstName" placeholder="Prenume" onChange={handleChange} required />
                <input name="lastName" placeholder="Nume" onChange={handleChange} required />
                <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
                <input name="phone" type="tel" placeholder="Telefon" onChange={handleChange} required />
                <input name="address" placeholder="Adresă" onChange={handleChange} required />
                <input name="city" placeholder="Oraș" onChange={handleChange} required />
                <input name="county" placeholder="Județ" onChange={handleChange} required />
                <input name="zip" placeholder="Cod poștal" onChange={handleChange} required />
                <input name="country" value={formData.country} readOnly />

                <label>🙵 Livrare:</label>
                <select name="delivery" onChange={handleChange}>
                    <option value="curier">Curier</option>
                    <option value="easybox">Easybox</option>
                </select>

                {formData.delivery === "easybox" && (
                    <input name="easyboxCode" placeholder="Cod Easybox" onChange={handleChange} required />
                )}

                <label>💳 Metodă de plată:</label>
                <select name="payment" onChange={handleChange}>
                    <option value="cash">Ramburs</option>
                    <option value="card">Card bancar</option>
                </select>

                <label>🏷️ Cupon:</label>
                <input name="coupon" value={formData.coupon} onChange={handleChange} placeholder="Introdu cuponul" />

                <p><strong>Total de plată (cu reduceri aplicate):</strong> {totalToDisplay.toFixed(2)} RON</p>

                <button type="submit" className="place-order-button">
                    Plasează comanda și primește factura
                </button>
            </form>

            {showStripe && (
                <div className="stripe-checkout">
                    <h3>💳 Plata cu cardul</h3>
                    <StripeCheckoutPage amount={totalToDisplay} />
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;
