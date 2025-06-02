import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/ss_bg.png";
import "./Navbar.css";

const Navbar = () => {
    const { cartItems } = useContext(CartContext);
    const { wishlistItems } = useContext(WishlistContext);
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("id");

    const [menuOpen, setMenuOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState("");
    const [lowStockCount, setLowStockCount] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();

    const closeMenu = () => setMenuOpen(false);

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        if (category) {
            navigate(`/shop?category=${category}`);
        } else {
            navigate("/shop");
        }
        closeMenu();
    };

    useEffect(() => {
        if (!location.pathname.includes("/shop")) {
            setActiveCategory("");
        }
    }, [location]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (role === "ADMIN" && token) {
            fetch("http://localhost:8080/products/low-stock", {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.ok ? res.json() : [])
                .then(data => setLowStockCount(data.length))
                .catch(err => console.error("❌ Eroare stoc redus:", err));
        }
    }, [role]);

    const currentProductId = location.pathname.startsWith("/product/")
        ? location.pathname.split("/").pop()
        : null;

    return (
        <>
            <nav className="navbar">
                <button className="menu-toggle" onClick={() => setMenuOpen(true)}>☰</button>

                <div className="navbar-center-logo">
                    <Link to="/shop">
                        <img src={logo} alt="Logo" className="logo-img-big" />
                    </Link>
                </div>

                <div className="navbar-icons">
                    <Link to="/wishlist" className="icon-link">❤️ ({wishlistItems.length})</Link>
                    <Link to="/cart" className="icon-link">🛒 ({cartItems.length})</Link>
                    <Link to="/account" className="icon-link">👤 Contul meu</Link>
                    {userId && (
                        <>
                            {role === "ADMIN" ? (
                                <Link to="/admin/matching-requests" className="icon-link">🧾 Cereri Matching</Link>
                            ) : (
                                <Link to={`/fidelity-card/${userId}`} className="icon-link">💳 Card</Link>
                            )}
                            {currentProductId && (
                                <Link to={`/matching-price/request/${currentProductId}`} className="icon-link">💰 Matching Price</Link>
                            )}
                        </>
                    )}
                </div>
            </nav>

            {menuOpen && <div className="backdrop" onClick={closeMenu} />}

            <div className={`side-menu ${menuOpen ? "open" : ""}`}>
                <button className="close-btn" onClick={closeMenu}>❮</button>
                <ul>
                    <li className="section-label">📁 Categorii</li>
                    <li><button className={`category-button ${activeCategory === "" ? "active-category" : ""}`} onClick={() => handleCategoryClick("")}>🛒 Toate produsele</button></li>
                    <li><button className={`category-button ${activeCategory === "telefon" ? "active-category" : ""}`} onClick={() => handleCategoryClick("telefon")}>📱 Telefoane</button></li>
                    <li><button className={`category-button ${activeCategory === "tableta" ? "active-category" : ""}`} onClick={() => handleCategoryClick("tableta")}>📲 Tablete</button></li>
                    <li><button className={`category-button ${activeCategory === "laptop" ? "active-category" : ""}`} onClick={() => handleCategoryClick("laptop")}>💻 Laptopuri</button></li>
                    <li><Link to="/campanii" onClick={closeMenu}>🏆 Campanii</Link></li>
                    <li><Link to="/return" onClick={closeMenu}>🔄 Retur produs</Link></li>

                    <hr style={{ margin: "10px 0", borderColor: "#333" }} />

                    <li><Link to="/my-orders" onClick={closeMenu}>📦 Comenzile mele</Link></li>
                    <li><Link to="/settings" onClick={closeMenu}>⚙️ Setări cont</Link></li>
                    <li><Link to="/informatii" onClick={closeMenu}>ℹ️ Informații utile</Link></li>

                    {role === "ADMIN" && (
                        <>
                            <li><Link to="/admin-reply" onClick={closeMenu}>👑 Admin Dashboard</Link></li>
                            <li style={{ position: "relative" }}>
                                <Link to="/admin/update-stock" onClick={closeMenu}>🔄 Actualizează stocuri</Link>
                                {lowStockCount > 0 && (
                                    <span style={{
                                        position: "absolute",
                                        top: "4px",
                                        right: "-8px",
                                        background: "red",
                                        color: "white",
                                        borderRadius: "50%",
                                        padding: "2px 6px",
                                        fontSize: "12px"
                                    }}>{lowStockCount}</span>
                                )}
                            </li>
                            <li><Link to="/add-product" onClick={closeMenu}>➕ Adaugă Produs</Link></li>
                            <li><Link to="/admin/manage-discounts" onClick={closeMenu}>💸 Admin Reduceri</Link></li>
                            <li><Link to="/admin-users" onClick={closeMenu}>🚫 Admin Ban Users</Link></li>
                            <li><Link to="/admin/reward-history" onClick={closeMenu}>📅 Istoric Puncte</Link></li>
                            <li><Link to="/admin/return-requests" onClick={closeMenu}>📥 Retururi</Link></li>
                            <li><Link to="/admin/matching-requests" onClick={closeMenu}>🧾 Cereri Matching Price</Link></li>
                        </>
                    )}
                </ul>
            </div>
        </>
    );
};

export default Navbar;
