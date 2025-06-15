import React, { useEffect, useState, useContext } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CartContext } from "../context/CartContext";
import "./StripeCheckoutPage.css";

const stripePromise = loadStripe("pk_test_51R4OgA14Om18N7m64OZduIGRm6mxusmATr9NEm3ABCKLiKrLfAkMudT17CoSCivbpyxdQAaHPdjizuwR77Z6l6VK00dGr6Hgng");

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const { clearCart } = useContext(CartContext);

    const [clientSecret, setClientSecret] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /* info salvate din localStorage */
    const orderId = localStorage.getItem("orderId");
    const email   = localStorage.getItem("email");
    const name    = localStorage.getItem("name");
    const zip     = localStorage.getItem("zip");
    const amount  = Number(localStorage.getItem("total"));
    const months  = localStorage.getItem("months") || "0";  // "0" = integrală

    const rateInfo = months !== "0" ? (amount / +months).toFixed(2) : null;

    /* obțin clientSecret de la backend */
    useEffect(() => {
        if (!amount || isNaN(amount) || amount <= 0) {
            alert("❌ Suma pentru plată nu este validă.");
            return;
        }

        fetch("http://localhost:8080/payment/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, months: months !== "0" ? +months : null })
        })
            .then(res => res.json())
            .then(data => setClientSecret(data.clientSecret))
            .catch(() => alert("❌ Eroare la obținerea tokenului Stripe."));
    }, [amount, months]);

    const handleSubmit = async e => {
        e.preventDefault();
        if (!stripe || !elements || !clientSecret) return;

        setLoading(true); setError("");

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
        } else if (result.paymentIntent.status === "succeeded") {
            try {
                /* salvez rate doar dacă există */
                if (months !== "0") {
                    await fetch("http://localhost:8080/installments/create", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify({
                            orderId,
                            months: +months,
                            total: amount
                        })
                    });
                }

                /* curăț coșul */
                await fetch("http://localhost:8080/cart/clear-after-payment", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                clearCart();

                alert("✅ Plata finalizată cu succes!");
                window.location.href = "/my-orders";
            } catch (err) {
                alert("Plata OK, dar actualizarea backend a eșuat.");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="stripe-checkout-form-custom">
            <h2>💳 Finalizează plata comenzii</h2>

            <input value={name}  readOnly />
            <input value={email} readOnly />
            <input value={zip}   readOnly />

            {months !== "0"
                ? <p className="rate-line">Plată în {months} luni • Rată: {rateInfo} RON/lună</p>
                : <p className="rate-line">Plată integrală</p>}

            <CardElement className="stripe-input" />

            {error && <p className="error">{error}</p>}

            <button type="submit" disabled={!stripe || loading}>
                {loading ? "Se procesează..." : "Plătește"}
            </button>
        </form>
    );
};

const StripeCheckoutPage = () => (
    <div className="stripe-checkout-container">
        <Elements stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
    </div>
);

export default StripeCheckoutPage;
