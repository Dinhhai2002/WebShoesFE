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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Reset CSS để đồng bộ */}
      <Router>
        <Header />
        <Routes>
          {/* <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/list-product" element={<ProductList />} /> */}
        </Routes>
        <Footer />
      </Router>
    </ThemeProvider>
  );
}

export default App;
