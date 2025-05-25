import React, { useEffect, useState, useContext } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CartContext } from "../context/CartContext";

const stripePromise = loadStripe("pk_test_51R4OgA14Om18N7m64OZduIGRm6mxusmATr9NEm3ABCKLiKrLfAkMudT17CoSCivbpyxdQAaHPdjizuwR77Z6l6VK00dGr6Hgng");

const CheckoutForm = ({ amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { cartItems, clearCart } = useContext(CartContext);

    const [clientSecret, setClientSecret] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [zip, setZip] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const numericAmount = Number(amount ?? 0); // 🔐 Protecție

    useEffect(() => {
        fetch("http://localhost:8080/payment/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: numericAmount })
        })
            .then(res => res.json())
            .then(data => setClientSecret(data.clientSecret))
            .catch(err => console.error(err));
    }, [numericAmount]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError("");

        const cardElement = elements.getElement(CardElement);
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name,
                    email,
                    address: { postal_code: zip }
                }
            }
        });

        setLoading(false);

        if (result.error) {
            console.error(result.error.message);
            setError(result.error.message);
            alert("❌ Plata a eșuat: " + result.error.message);
        } else if (result.paymentIntent.status === "succeeded") {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    alert("❌ Token JWT lipsă. Te rugăm să te loghezi din nou.");
                    return;
                }

                localStorage.setItem("email", email);
                const orderId = Math.random().toString(36).substring(2, 9);

                const produse = cartItems.map(item => ({
                    name: item.name,
                    price: item.price.toFixed(2),
                    qty: item.quantity
                }));

                const comanda = {
                    orderId,
                    numeClient: name,
                    emailClient: email,
                    total: numericAmount.toFixed(2), // ✅ Safe
                    couponCode: "STRIPECARD",
                    products: produse
                };

                const facturaRes = await fetch("http://localhost:8080/api/facturi/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(comanda)
                });

                if (!facturaRes.ok) {
                    throw new Error("❌ Eroare generare factură.");
                }

                const checkoutRes = await fetch("http://localhost:8080/cart/checkout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!checkoutRes.ok) {
                    const errText = await checkoutRes.text();
                    alert("❌ Plata a fost făcută, dar comanda a eșuat: " + errText);
                    return;
                }

                clearCart();
                alert("✅ Plata și comanda finalizate cu succes!");
                window.location.href = "/my-orders";
            } catch (err) {
                console.error("❌ Eroare checkout:", err);
                alert("❌ Plata reușită, dar comanda NU a putut fi procesată!");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "auto" }}>
            <input
                type="text"
                placeholder="Nume"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <input
                type="text"
                placeholder="Cod poștal (ZIP)"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                required
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <CardElement style={{ base: { fontSize: "16px" } }} />
            {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
            <button type="submit" disabled={!stripe || loading} style={{ marginTop: "20px", padding: "10px" }}>
                {loading ? "Se procesează..." : "Plătește"}
            </button>
        </form>
    );
};

const StripeCheckoutPage = ({ amount }) => (
    <Elements stripe={stripePromise}>
        <CheckoutForm amount={amount} />
    </Elements>
);

export default StripeCheckoutPage;
