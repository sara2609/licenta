import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ConfirmPage from "./components/ConfirmPage";
import ShopPage from "./components/ShopPage";
import AddProductPage from "./components/AddProductPage";
import WishlistPage from "./components/WishlistPage";
import AccountPage from "./components/AccountPage";
import MyOrdersPage from "./components/MyOrdersPage";
import CartPage from "./components/CartPage";
import Navbar from "./components/Navbar";
import SettingsPage from "./components/SettingsPage";
import PaymentCardPage from "./components/PaymentCardPage";
import PaymentCryptoPage from "./components/PaymentCryptoPage";
import CheckoutPage from "./components/CheckoutPage";
import StripeCheckoutPage from "./components/StripeCheckoutPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ChatWidget from "./components/ChatWidget";
import AdminReplyPage from "./components/AdminReplyPage";
import ProductPage from "./components/ProductPage";
import CampaniiPage from "./components/CampaniiPage";
import AdminUsersPage from "./components/AdminUsersPage";
import UpdateStockPage from "./components/UpdateStockPage";
import FidelityCard from "./components/FidelityCard";
import FidelityQRView from "./components/FidelityQRView";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import DailyRewardPage from "./components/DailyRewardPage";
import RewardHistoryAdminPage from "./components/RewardHistoryAdminPage";
import ManageDiscountsPage from "./components/ManageDiscountsPage";
import ReturnPage from "./components/ReturnPage";
import AdminReturnRequestsPage from "./components/AdminReturnRequestsPage";
import TermeniPage from "./components/TermeniPage"; // sau ./pages/ dacă acolo ai pus-o
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import InformatiiPage from "./components/InformatiiPage";
import MatchingPriceForm from "./components/MatchingPriceForm";
import AdminMatchingRequestsPage from "./components/AdminMatchingRequestsPage";

function App() {
    return (
        <ThemeProvider>
            <WishlistProvider>
                <CartProvider>
                    <AuthProvider>
                        <Router>
                            <Routes>
                                <Route path="/" element={<LoginForm />} />
                                <Route path="/login" element={<LoginForm />} />
                                <Route path="/register" element={<RegisterForm />} />
                                <Route path="/confirm" element={<ConfirmPage />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route path="/shop" element={<><Navbar /><ShopPage /><ChatWidget /></>} />
                                <Route path="/add-product" element={<><Navbar /><AddProductPage /><ChatWidget /></>} />
                                <Route path="/wishlist" element={<><Navbar /><WishlistPage /><ChatWidget /></>} />
                                <Route path="/account" element={<><Navbar /><AccountPage /><ChatWidget /></>} />
                                <Route path="/my-orders" element={<><Navbar /><MyOrdersPage /><ChatWidget /></>} />
                                <Route path="/cart" element={<><Navbar /><CartPage /><ChatWidget /></>} />
                                <Route path="/settings" element={<><Navbar /><SettingsPage /><ChatWidget /></>} />
                                <Route path="/payment-card" element={<><Navbar /><PaymentCardPage /><ChatWidget /></>} />
                                <Route path="/payment-crypto" element={<><Navbar /><PaymentCryptoPage /><ChatWidget /></>} />
                                <Route path="/checkout" element={<><Navbar /><CheckoutPage /><ChatWidget /></>} />
                                <Route path="/stripe-payment" element={<><Navbar /><StripeCheckoutPage /><ChatWidget /></>} />
                                <Route path="/product/:id" element={<><Navbar /><ProductPage /><ChatWidget /></>} />
                                <Route path="/campanii" element={<><Navbar /><CampaniiPage /><ChatWidget /></>} />
                                <Route path="/fidelity/qr-view" element={<FidelityQRView />} />
                                <Route path="/fidelity-card/:id" element={<ProtectedRoute><><Navbar /><FidelityCard /><ChatWidget /></></ProtectedRoute>} />
                                <Route path="/admin-reply" element={<><Navbar /><AdminReplyPage /></>} />
                                <Route path="/admin-users" element={<><Navbar /><AdminUsersPage /></>} />
                                <Route path="/admin/update-stock" element={<><Navbar /><UpdateStockPage /></>} />
                                <Route path="/admin/manage-discounts" element={<><Navbar /><ManageDiscountsPage /></>} />
                                <Route path="/admin/return-requests" element={<><Navbar /><AdminReturnRequestsPage /></>} />
                                <Route path="/daily-reward" element={<><Navbar /><DailyRewardPage /><ChatWidget /></>} />
                                <Route path="/admin/reward-history" element={<><Navbar /><RewardHistoryAdminPage /></>} />
                                <Route path="/return" element={<><Navbar /><ReturnPage /></>} />
                                <Route path="/termeni" element={<TermeniPage />} />
                                <Route path="/informatii" element={<InformatiiPage />} />
                                <Route path="/matching-price/request/:productId" element={<><Navbar /><MatchingPriceForm /></>} />
                                <Route path="/admin/matching-requests" element={<><Navbar /><AdminMatchingRequestsPage /></>} />
                            </Routes>
                        </Router>
                    </AuthProvider>
                </CartProvider>
            </WishlistProvider>
        </ThemeProvider>
    );
}

export default App;
