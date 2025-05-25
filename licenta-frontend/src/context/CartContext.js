import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [tokenReady, setTokenReady] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setTokenReady(true);
    }, []);

    useEffect(() => {
        if (tokenReady) fetchCart();
    }, [tokenReady]);

    const fetchCart = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch("http://localhost:8080/cart", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setCartItems(data.map(item => ({
                    id: item.id,
                    productId: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    usedPoints: item.usedPoints || 0,
                    pointsApplied: item.pointsApplied || false,
                    appliedDiscount: item.appliedDiscount || 0.0
                })));
            }
        } catch (err) {
            console.error("❌ Eroare la fetch cart:", err);
        }
    };

    const addToCart = async (product) => {
        const token = localStorage.getItem("token");
        if (!token) return alert("Trebuie să fii logat!");

        try {
            const res = await fetch(`http://localhost:8080/cart/add/${product.id}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                await fetchCart();
                alert("✅ Produs adăugat în coș");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const removeFromCart = async (id) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch(`http://localhost:8080/cart/remove/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) await fetchCart();
        } catch (err) {
            console.error(err);
        }
    };

    const updateQuantity = async (id, quantity) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await fetch(`http://localhost:8080/cart/update/${id}?quantity=${quantity}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchCart();
        } catch (err) {
            console.error(err);
        }
    };

    const applyPointsToCart = async (pointsPerProduct) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch("http://localhost:8080/cart/apply-points", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(pointsPerProduct)
            });

            if (res.ok) {
                await fetchCart();
            } else {
                const text = await res.text();
                console.error("❌ Server error:", text);
                alert("❌ " + text);
            }
        } catch (err) {
            console.error("❌ Eroare la aplica puncte:", err);
        }
    };

    const clearCart = () => setCartItems([]);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            applyPointsToCart,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
