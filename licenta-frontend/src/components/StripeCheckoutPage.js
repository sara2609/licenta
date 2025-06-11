// ✅ StripeCheckoutPage.js - FINAL
import React, { useEffect, useState, useContext } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CartContext } from "../context/CartContext";

const stripePromise = loadStripe("pk_test_51R4OgA14Om18N7m64OZduIGRm6mxusmATr9NEm3ABCKLiKrLfAkMudT17CoSCivbpyxdQAaHPdjizuwR77Z6l6VK00dGr6Hgng");

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const { clearCart } = useContext(CartContext);

    const [clientSecret, setClientSecret] = useState("");
    const [months, setMonths] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const orderId = localStorage.getItem("orderId");
    const email = localStorage.getItem("email");
    const name = localStorage.getItem("name");
    const zip = localStorage.getItem("zip");
    const amount = Number(localStorage.getItem("total"));

    useEffect(() => {
        if (!amount || isNaN(amount) || amount <= 0) {
            alert("❌ Suma pentru plată nu este validă.");
            return;
        }

        fetch("http://localhost:8080/payment/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, months: months ? parseInt(months) : null })
        })
            .then(res => res.json())
            .then(data => {
                if (!data.clientSecret) {
                    alert("❌ Tokenul de plată Stripe nu a fost generat.");
                    return;
                }
                setClientSecret(data.clientSecret);
            })
            .catch(err => {
                console.error("❌ fetch /payment/create:", err);
                alert("❌ Eroare la obținerea tokenului de plată.");
            });
    }, [amount, months]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements || !clientSecret) return;

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
            setError(result.error.message);
            alert("❌ Plata a eșuat: " + result.error.message);
        } else if (result.paymentIntent.status === "succeeded") {
            try {
                if (months) {
                    localStorage.setItem("months", months);
                    localStorage.setItem("monthly", (amount / months).toFixed(2));

                    await fetch("http://localhost:8080/installments/create", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}` // ✅ Adăugat
                        },
                        body: JSON.stringify({
                            orderId,
                            months: parseInt(months),
                            total: amount
                        })
                    });
                }

                clearCart();

                await fetch("http://localhost:8080/cart/clear-after-payment", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });

                alert("✅ Plata finalizată cu succes!");
                window.location.href = "/my-orders";
            } catch (err) {
                console.error("❌ Eroare backend:", err);
                alert("Plata a mers, dar ceva n-a mers la backend.");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="stripe-form">
            <h2>💳 Finalizează plata comenzii</h2>
            <input type="text" value={name} readOnly />
            <input type="email" value={email} readOnly />
            <input type="text" value={zip} readOnly />

            <label>Alege plata în rate:</label>
            <select value={months} onChange={(e) => setMonths(e.target.value)}>
                <option value="">Plată integrală</option>
                <option value="6">6 luni</option>
                <option value="12">12 luni</option>
                <option value="18">18 luni</option>
                <option value="24">24 luni</option>
                <option value="36">36 luni</option>
            </select>

            {months && <p>Rată estimată: {(amount / months).toFixed(2)} RON/lună</p>}

            <CardElement />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button type="submit" disabled={!stripe || loading}>
                {loading ? "Se procesează..." : "Plătește"}
            </button>
        </form>
    );
};

const StripeCheckoutPage = () => (
    <Elements stripe={stripePromise}>
        <CheckoutForm />
    </Elements>
);

export default StripeCheckoutPage;
