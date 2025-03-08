import React, { createContext, useState, ReactNode, useEffect } from 'react';
import cartApi from '../services/API/CartApi';

// Định nghĩa giao diện cho sản phẩm trong giỏ hàng
interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// Định nghĩa giao diện cho context
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
}

// Tạo context với giá trị mặc định
export const CartContext = createContext<CartContextType | undefined>(undefined);

// Tạo provider để bao bọc các thành phần cần truy cập giỏ hàng
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
   const [cart, setCart] = useState<CartItem[]>([
    {
      id: 1,
      name: "Nike Air Force 1",
      price: 120,
      image: "https://imgwebikenet-8743.kxcdn.com/catalogue/10063/bl420mru-3_s.jpg",
      quantity: 1,
    },
    {
      id: 2,
      name: "Adidas Ultraboost",
      price: 150,
      image: "https://imgwebikenet-8743.kxcdn.com/catalogue/10063/bl420mru-3_s.jpg",
      quantity: 1,
    },
  ]);
  // useEffect(() =>{
  //   cartApi.getCartItems().then((items) => {
  //       console.log("Cart Items:", items);
  //     }).catch((error) => {
  //       console.error("Error fetching cart items:", error);
  //     });
  // })

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => [...prevCart, item]);
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};
