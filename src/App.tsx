import React from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import theme from "./theme"; // Import theme đã tạo
import Header from "./components/Header";
import Footer from "./components/Footer";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Product from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductList from "./pages/ProductList";
import PaymentSuccess from "./pages/PaymentSuccess";
import OrderHistory from "./pages/OrderHistory";
import OrderDetail from "./pages/OrderDetail";
import { CartProvider } from "./context/CartContext";
// import { customTheme } from "./style/themeCustom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login/Login";
import Register from "./pages/Register";
import OTPVerification from "./pages/OTPVerification";
import { AuthProvider } from "./context/AuthContext";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh' // Đảm bảo chiều cao tối thiểu là full viewport
      }}>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <CssBaseline /> {/* Reset CSS để đồng bộ */}
        <Router>
          <AuthProvider>
            <CartProvider>
              <Header />
              <Box sx={{ flex: 1 }}> {/* Phần content sẽ tự động căn chỉnh */}
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/authentication/login" element={<Login />} />
                  <Route path="/authentication/register" element={<Register />} />
                  <Route path="/authentication/verify-otp" element={<OTPVerification />} />
                  <Route path="/authentication/forgot-password" element={<ForgotPassword />} />
                  <Route path="/authentication/reset-password" element={<ResetPassword />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/product/:id" element={<Product />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/order-history" element={<OrderHistory />} />
                  <Route path="/order/:id" element={<OrderDetail />} />
                </Routes>
              </Box>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </Router>
      </Box>
    </ThemeProvider>
  );
}

export default App;
