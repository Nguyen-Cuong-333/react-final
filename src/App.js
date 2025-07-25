import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Wishlist from "./pages/Wishlist";
import OrderHistory from "./pages/OrderHistory";
import Profile from "./pages/Profile";
import Chatbot from "./components/Chatbot";
import SaleNotificationManager from "./components/SaleNotificationManager";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <SaleNotificationManager>
            {(saleNotiCount) => <Navbar saleNotiCount={saleNotiCount} />}
          </SaleNotificationManager>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <Chatbot />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
