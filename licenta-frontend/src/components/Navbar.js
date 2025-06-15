import {
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CartContext }      from "../context/CartContext";
import { WishlistContext }  from "../context/WishlistContext";
import logo       from "../assets/ss_bg.png";
import AuthModal  from "./AuthModal";
import "./Navbar.css";

const Navbar = () => {
    const { cartItems }     = useContext(CartContext);
    const { wishlistItems } = useContext(WishlistContext);

    const role   = localStorage.getItem("role"); // "ADMIN" / "USER" / null
    const userId = localStorage.getItem("id");

    const [menuOpen,        setMenuOpen]        = useState(false);
    const [activeCategory,  setActiveCategory]  = useState("");
    const [lowStockCount,   setLowStockCount]   = useState(0);


    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingRoute,  setPendingRoute]  = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const closeMenu = () => setMenuOpen(false);


    const handleCategoryClick = (cat) => {
        setActiveCategory(cat);
        navigate(cat ? `/shop?category=${cat}` : "/shop");
        closeMenu();
    };


    const requestAuth = useCallback(
        (route) => {
            if (!localStorage.getItem("token")) {
                setPendingRoute(route);
                setShowAuthModal(true);
            } else {
                navigate(route);
            }
        },
        [navigate]
    );

    const handleContinue = () => {
        setShowAuthModal(false);
        if (pendingRoute) navigate(pendingRoute);
    };
    const handleRegister = () => navigate("/register");

    /* resetăm categoria când ieșim din /shop */
    useEffect(() => {
        if (!location.pathname.includes("/shop")) setActiveCategory("");
    }, [location]);

    /* admin – produse cu stoc redus */
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (role === "ADMIN" && token) {
            fetch("http://localhost:8080/products/low-stock", {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((r) => (r.ok ? r.json() : []))
                .then((d) => setLowStockCount(d.length))
                .catch((e) => console.error("❌ Eroare stoc redus:", e));
        }
    }, [role]);

    /* id produs curent (pentru Matching-Price) */
    const currentProductId = location.pathname.startsWith("/product/")
        ? location.pathname.split("/").pop()
        : null;

    /* props convenabile pt side-menu */
    const authLinkProps = (route) => ({
        to: route,
        onClick: (e) => {
            e.preventDefault();
            requestAuth(route);
            closeMenu();
        },
    });

    return (
        <>
            <nav className="navbar">
                <button className="menu-toggle" onClick={() => setMenuOpen(true)}>☰</button>

                <div className="navbar-center-logo">
                    <Link to="/shop">
                        <img src={logo} alt="Logo" className="logo-img-big" />
                    </Link>
                </div>

                {/* ------------- ICON-URI DREAPTA SUS ------------- */}
                <div className="navbar-icons">
                    <Link
                        to="/wishlist"
                        className="icon-link"
                        onClick={(e) => { e.preventDefault(); requestAuth("/wishlist"); }}
                    >
                        ❤️ ({wishlistItems.length})
                    </Link>

                    <Link
                        to="/cart"
                        className="icon-link"
                        onClick={(e) => { e.preventDefault(); requestAuth("/cart"); }}
                    >
                        🛒 ({cartItems.length})
                    </Link>

                    <Link
                        to="/account"
                        className="icon-link"
                        onClick={(e) => { e.preventDefault(); requestAuth("/account"); }}
                    >
                        👤 Contul meu
                    </Link>

                    {userId && (
                        <>
                            {/* admin vede cereri, user vede card-fidelitate */}
                            {role === "ADMIN" ? (
                                <Link
                                    to="/admin/matching-requests"
                                    className="icon-link"
                                    onClick={(e) => { e.preventDefault(); requestAuth("/admin/matching-requests"); }}
                                >
                                    🧾 Cereri Matching
                                </Link>
                            ) : (
                                <Link
                                    to={`/fidelity-card/${userId}`}
                                    className="icon-link"
                                    onClick={(e) => { e.preventDefault(); requestAuth(`/fidelity-card/${userId}`); }}
                                >
                                    💳 Card
                                </Link>
                            )}

                            {/* ———> AICI e singura modificare ←——— */}
                            {currentProductId && role !== "ADMIN" && (
                                <Link
                                    to={`/matching-price/request/${currentProductId}`}
                                    className="icon-link"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        requestAuth(`/matching-price/request/${currentProductId}`);
                                    }}
                                >
                                    💰 Matching Price
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </nav>

            {/* backdrop pentru side-menu */}
            {menuOpen && <div className="backdrop" onClick={closeMenu} />}

            {/* ------------------------- SIDE-MENU ------------------------- */}
            <div className={`side-menu ${menuOpen ? "open" : ""}`}>
                <button className="close-btn" onClick={closeMenu}>❮</button>
                <ul>
                    <li className="section-label">📁 Categorii</li>

                    <li>
                        <button
                            className={`category-button ${activeCategory === "" ? "active-category" : ""}`}
                            onClick={() => handleCategoryClick("")}
                        >
                            🛒 Toate produsele
                        </button>
                    </li>
                    <li>
                        <button
                            className={`category-button ${activeCategory === "telefon" ? "active-category" : ""}`}
                            onClick={() => handleCategoryClick("telefon")}
                        >
                            📱 Telefoane
                        </button>
                    </li>
                    <li>
                        <button
                            className={`category-button ${activeCategory === "tableta" ? "active-category" : ""}`}
                            onClick={() => handleCategoryClick("tableta")}
                        >
                            📲 Tablete
                        </button>
                    </li>
                    <li>
                        <button
                            className={`category-button ${activeCategory === "laptop" ? "active-category" : ""}`}
                            onClick={() => handleCategoryClick("laptop")}
                        >
                            💻 Laptopuri
                        </button>
                    </li>

                    <li><Link {...authLinkProps("/campanii")}>🏆 Campanii</Link></li>
                    <li><Link {...authLinkProps("/return")}>🔄 Retur produs</Link></li>

                    <hr style={{ margin: "10px 0", borderColor: "#333" }} />

                    <li><Link {...authLinkProps("/my-orders")}>📦 Comenzile mele</Link></li>
                    <li><Link {...authLinkProps("/settings")}>⚙️ Setări cont</Link></li>
                    <li><Link {...authLinkProps("/informatii")}>ℹ️ Informații utile</Link></li>

                    {role === "ADMIN" && (
                        <>
                            <li><Link {...authLinkProps("/admin-reply")}>👑 Admin Dashboard</Link></li>

                            <li style={{ position: "relative" }}>
                                <Link {...authLinkProps("/admin/update-stock")}>🔄 Actualizează stocuri</Link>
                                {lowStockCount > 0 && (
                                    <span
                                        style={{
                                            position: "absolute",
                                            top: "4px",
                                            right: "-8px",
                                            background: "red",
                                            color: "white",
                                            borderRadius: "50%",
                                            padding: "2px 6px",
                                            fontSize: "12px",
                                        }}
                                    >
                    {lowStockCount}
                  </span>
                                )}
                            </li>

                            <li><Link {...authLinkProps("/add-product")}>➕ Adaugă Produs</Link></li>
                            <li><Link {...authLinkProps("/admin/manage-discounts")}>💸 Admin Reduceri</Link></li>
                            <li><Link {...authLinkProps("/admin-users")}>🚫 Admin Ban Users</Link></li>
                            <li><Link {...authLinkProps("/admin/reward-history")}>📅 Istoric Puncte</Link></li>
                            <li><Link {...authLinkProps("/admin/return-requests")}>📥 Retururi</Link></li>
                            <li><Link {...authLinkProps("/admin/matching-requests")}>🧾 Cereri Matching Price</Link></li>
                        </>
                    )}
                </ul>
            </div>

            {/* modal auth */}
            {showAuthModal && (
                <AuthModal
                    onContinue={handleContinue}
                    onRegister={handleRegister}
                    onClose={() => setShowAuthModal(false)}
                />
            )}
        </>
    );
};

export default Navbar;
