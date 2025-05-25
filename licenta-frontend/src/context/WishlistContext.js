import { createContext, useState, useEffect } from "react";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [tokenReady, setTokenReady] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setTokenReady(true);
    }, []);

    useEffect(() => {
        if (tokenReady) fetchWishlist();
    }, [tokenReady]);

    const fetchWishlist = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await fetch("http://localhost:8080/wishlist", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setWishlistItems(data);
            } else {
                console.error("Eroare la fetch wishlist:", res.status);
            }
        } catch (err) {
            console.error("Eroare la fetch wishlist:", err);
        }
    };

    const addToWishlist = async (product) => {
        const token = localStorage.getItem("token");
        if (!token) return "❌ Trebuie să fii logat pentru wishlist.";
        try {
            const res = await fetch(`http://localhost:8080/wishlist/add/${product.id}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            const text = await res.text();
            if (res.ok) {
                await fetchWishlist();
                return text;
            } else {
                return `❌ ${text}`;
            }
        } catch (err) {
            console.error("❌ Eroare rețea:", err);
            return "❌ Eroare de rețea la adăugare în wishlist.";
        }
    };

    const removeFromWishlist = async (productId) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await fetch(`http://localhost:8080/wishlist/remove/${productId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                await fetchWishlist();
            } else {
                console.error("❌ Eroare stergere wishlist:", await res.text());
            }
        } catch (err) {
            console.error("❌ Eroare rețea:", err);
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
