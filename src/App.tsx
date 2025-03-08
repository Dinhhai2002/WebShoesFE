import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme"; // Import theme đã tạo
import Header from "./components/Header";
import Footer from "./components/Footer";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Product from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductList from "./pages/ProductList";
import { CartProvider } from "./context/CartContext";
// import { customTheme } from "./style/themeCustom";
import { ToastContainer } from "../node_modules/react-toastify/dist/index";
import Login from "./pages/Login/Login";
import { AuthProvider } from "./context/AuthContext";
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Reset CSS để đồng bộ */}
      <ToastContainer />
      <Router>
      <AuthProvider>
      <CartProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/authentication/login" element={<Login />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/list-product" element={<ProductList />} />
        </Routes>
        <Footer />
        </CartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
