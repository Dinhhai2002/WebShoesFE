import React, { createContext, useState, ReactNode, useEffect } from 'react';
import cartApi from '../services/API/CartApi';
import { useAuth } from './AuthContext';
import { CartDetail, CartDetailRequest } from '../services/API/CartApi';

// Định nghĩa giao diện cho sản phẩm chi tiết
interface ProductDetail {
  id: number;
  name: string;
  product_id: number;
  color_id: number;
  color: string;
  size_id: number;
  size: string;
  material_id: number;
  material: string;
  stock: number;
  price: number;
  image_url: string;
  status: number;
}

// Định nghĩa giao diện cho sản phẩm trong giỏ hàng
interface CartItem {
  id: number;
  cart_id: number;
  product_detail_id: number;
  quantity: number;
  product_detail: ProductDetail;
}

// Định nghĩa giao diện cho context
interface CartContextType {
  cart: CartDetail[];
  addToCart: (productDetailId: number, quantity: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Tạo context với giá trị mặc định
export const CartContext = createContext<CartContextType | undefined>(undefined);

// Tạo provider để bao bọc các thành phần cần truy cập giỏ hàng
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, cartItems, setCartItems } = useAuth();
  const [cart, setCart] = useState<CartDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync cart data when authentication status or cartItems change
  useEffect(() => {
    setCart(cartItems);
    setLoading(false);
  }, [cartItems]);

  const addToCart = async (productDetailId: number, quantity: number) => {
    try {
      setLoading(true);
      if (isAuthenticated) {
        // Nếu đã đăng nhập, gọi API để thêm vào giỏ hàng
        const cartId = localStorage.getItem("cartId");
        if (!cartId) {
          throw new Error("Cart ID not found");
        }

        const request: CartDetailRequest = {
          cart_id: parseInt(cartId),
          product_detail_id: productDetailId,
          quantity: quantity
        };
        
        const response = await cartApi.create(request);
        
        // Cập nhật state với dữ liệu mới từ API
        setCart(prevCart => [...prevCart, response.data]);
        setCartItems(prevItems => [...prevItems, response.data]);
      } else {
        setError("Please login to add items to cart");
      }
    } catch (err) {
      setError('Error adding item to cart');
      console.error('Error adding to cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (id: number) => {
    try {
      setLoading(true);
      if (isAuthenticated) {
        // Nếu đã đăng nhập, gọi API để xóa khỏi giỏ hàng
        await cartApi.update(id, { product_detail_id: id, quantity: 0 });
        
        // Cập nhật state
        setCart(prevCart => prevCart.filter(item => item.id !== id));
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
      } else {
        setError("Please login to remove items from cart");
      }
    } catch (err) {
      setError('Error removing item from cart');
      console.error('Error removing from cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    try {
      setLoading(true);
      if (isAuthenticated) {
        // Nếu đã đăng nhập, gọi API để cập nhật số lượng
        const request: CartDetailRequest = {
          product_detail_id: id,
          quantity: quantity
        };
        
        await cartApi.update(id, request);
        
        // Cập nhật state
        setCart(prevCart =>
          prevCart.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        );
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        );
      } else {
        setError("Please login to update cart quantity");
      }
    } catch (err) {
      setError('Error updating cart quantity');
      console.error('Error updating quantity:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, loading, error }}>
      {children}
    </CartContext.Provider>
  );
};
