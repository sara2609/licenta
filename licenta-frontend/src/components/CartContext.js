// ✅ src/context/CartContext.jsx (Păstrează doar acesta!)
import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [tokenReady, setTokenReady] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setTokenReady(true);
        }
    }, []);

    useEffect(() => {
        if (tokenReady) {
            fetchCart();
        }
    }, [tokenReady]);

    const fetchCart = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.warn("⚠️ Token lipsă, nu se poate prelua coșul.");
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/cart", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                console.log("📥 Coș preluat din backend:", data);

                setCartItems(data.map(item => ({
                    id: item.id,
                    productId: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity
                })));
            } else {
                console.error("❌ Eroare la preluarea coșului:", res.status);
            }
        } catch (err) {
            console.error("❌ Eroare rețea la fetchCart:", err);
        }
    };

    const addToCart = async (product) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("❌ Trebuie să fii autentificat ca să adaugi în coș!");
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/cart/add/${product.id}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (res.ok) {
                await fetchCart();
                alert("✅ Adăugat în coș!");
            } else {
                const errText = await res.text();
                console.error("❌ Backend error:", errText);
                alert("❌ " + errText);
            }
        } catch (err) {
            console.error("❌ Eroare rețea:", err);
            alert("❌ Nu s-a putut conecta la server.");
        }
    };

    const removeFromCart = async (cartItemId) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch(`http://localhost:8080/cart/remove/${cartItemId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                await fetchCart();
            } else {
                console.error("❌ Eroare la ștergere:", await res.text());
            }
        } catch (err) {
            console.error("❌ Eroare rețea la ștergere:", err);
        }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};