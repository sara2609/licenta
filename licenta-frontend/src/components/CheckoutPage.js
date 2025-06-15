import { useState, useContext } from "react";
import { useNavigate }          from "react-router-dom";
import { CartContext }          from "../context/CartContext";
import "./CheckoutPage.css";

const CheckoutPage = () => {
    const { cartItems, clearCart } = useContext(CartContext);

    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "", phone: "",
        address: "", city: "", county: "", zip: "",
        country: "România", delivery: "curier", easyboxCode: "",
        payment: "cash", coupon: ""
    });

    /* 0 = plată integrală */
    const [months,      setMonths]      = useState("0");
    const [finalTotal,  setFinalTotal]  = useState(null);
    const navigate                     = useNavigate();

    /* ---------- helpers ---------- */
    const handleChange = ({ target:{ name, value } }) =>
        setFormData(prev => ({ ...prev, [name]: value }));

    const localTotal = cartItems.reduce((s,i) =>
        s + i.price * i.quantity - (i.appliedDiscount||0), 0);

    const total      = Number(finalTotal ?? localTotal ?? 0);
    const rataEst    = months !== "0" ? (total / +months).toFixed(2) : null;

    /* ---------- submit ---------- */
    const handleSubmit = async e => {
        e.preventDefault();

        const orderId = "ORD-" + Date.now();
        const token   = localStorage.getItem("token");

        try {
            /* 🎯 1. Checkout backend */
            const resp = await fetch("http://localhost:8080/cart/checkout", {
                method :"POST",
                headers:{
                    "Content-Type":"application/json",
                    Authorization:`Bearer ${token}`
                },
                body: JSON.stringify({
                    payment : formData.payment,
                    months  : formData.payment==="card" && months!=="0" ? +months : null
                })
            });

            if (!resp.ok) {
                alert("❌ Eroare la procesarea comenzii.");
                return;
            }

            const { total:serverTotal } = await resp.json();
            setFinalTotal(+serverTotal);

            /* 🎯 2. Salvăm în localStorage pt. Stripe */
            localStorage.setItem("orderId", orderId);
            localStorage.setItem("email", formData.email);
            localStorage.setItem("name",  `${formData.firstName} ${formData.lastName}`);
            localStorage.setItem("zip",   formData.zip);
            localStorage.setItem("total", String(serverTotal));
            localStorage.setItem("months", months);          // "0" => integrală

            /* 🎯 3. Redirect */
            if (formData.payment === "card") {
                navigate("/stripe-payment");
            } else {
                clearCart();
                alert("✅ Comanda plasată și factura trimisă!");
                navigate("/my-orders");
            }

        } catch (err) {
            console.error(err);
            alert("❌ Eroare la conectarea cu serverul!");
        }
    };

    /* ---------- UI ---------- */
    return (
        <div className="checkout-container">
            <h2>📟 Detalii de facturare</h2>

            <form onSubmit={handleSubmit} className="checkout-form">
                {/* --- date client --- */}
                <input name="firstName" placeholder="Prenume"  onChange={handleChange} required />
                <input name="lastName"  placeholder="Nume"     onChange={handleChange} required />
                <input name="email"     type="email" placeholder="Email"  onChange={handleChange} required />
                <input name="phone"     type="tel"   placeholder="Telefon" onChange={handleChange} required />

                {/* --- adresă --- */}
                <input name="address" placeholder="Adresă" onChange={handleChange} required />
                <input name="city"    placeholder="Oraș"   onChange={handleChange} required />
                <input name="county"  placeholder="Județ"  onChange={handleChange} required />
                <input name="zip"     placeholder="Cod poștal" onChange={handleChange} required />
                <input name="country" value={formData.country} readOnly />

                {/* --- livrare --- */}
                <label>🙵 Livrare:</label>
                <select name="delivery" value={formData.delivery} onChange={handleChange}>
                    <option value="curier">Curier</option>
                    <option value="easybox">Easybox</option>
                </select>

                {formData.delivery === "easybox" && (
                    <input
                        name="easyboxCode"
                        placeholder="Cod Easybox"
                        onChange={handleChange}
                        required
                    />
                )}

                {/* --- plată --- */}
                <label>💳 Metodă de plată:</label>
                <select name="payment" value={formData.payment} onChange={handleChange}>
                    <option value="cash">Ramburs</option>
                    <option value="card">Card bancar</option>
                </select>

                {/* --- rate doar la card --- */}
                {formData.payment === "card" && (
                    <>
                        <label>📅 Perioadă plată în rate:</label>
                        <select value={months} onChange={e=>setMonths(e.target.value)}>
                            <option value="0">Plată integrală</option>
                            <option value="6">6 luni</option>
                            <option value="12">12 luni</option>
                            <option value="18">18 luni</option>
                            <option value="24">24 luni</option>
                            <option value="36">36 luni</option>
                        </select>

                        {months!=="0" && (
                            <p>Rată estimată: {rataEst} RON/lună</p>
                        )}
                    </>
                )}

                {/* --- cupon --- */}
                <label>🏷️ Cupon:</label>
                <input
                    name="coupon"
                    value={formData.coupon}
                    onChange={handleChange}
                    placeholder="Introdu cuponul"
                />

                <p><strong>Total de plată:</strong> {total.toFixed(2)} RON</p>

                <button className="place-order-button">
                    Plasează comanda și primește factura
                </button>
            </form>
        </div>
    );
};

export default CheckoutPage;
