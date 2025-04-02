import * as React from 'react'; // Fix TS error: allowSyntheticDefaultImports
import { createContext, useState, ReactNode, useEffect } from 'react';
import cartApi from '../services/API/CartApi';
import { useAuth } from './AuthContext';
import { CartDetail, CartDetailRequest } from '../services/API/CartApi';
import { toast } from 'react-toastify';

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

// Định nghĩa giao diện cho sản phẩm trong giỏ hàng và export nó
export interface CartItem { // Added export keyword
  id: number;
  cart_id: number;
  product_detail_id: number;
  quantity: number;
  product_detail: ProductDetail;
}

// Định nghĩa giao diện cho context
export interface CartContextType {
  cart: CartDetail[];
  setCart: (cart: CartDetail[]) => void;
  addToCart: (productDetailId: number, quantity: number, cartItem?: CartItem) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  migrateLocalCartToServer: () => Promise<void>;
  resetCart: () => void;
  loading: boolean;
  error: string | null;
}

// Tạo context với giá trị mặc định
export const CartContext = createContext<CartContextType | undefined>(undefined);

// Tạo provider để bao bọc các thành phần cần truy cập giỏ hàng
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }: { children: ReactNode }) => { // Add type for children prop
  const { isAuthenticated, cartItems, setCartItems } = useAuth();
  const [cart, setCart] = useState<CartDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cart from localStorage when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      const savedCart = localStorage.getItem('localCart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } else {
      setCart(cartItems);
    }
    setLoading(false);
  }, [isAuthenticated, cartItems]);

  // Save cart to localStorage when it changes and user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('localCart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const resetCart = () => {
    setCart([]);
    if (isAuthenticated) {
      setCartItems([]);
    } else {
      localStorage.removeItem('localCart');
    }
  };

  const migrateLocalCartToServer = async () => {
    try {
      setLoading(true);
      const localCart = localStorage.getItem('localCart');
      if (!localCart) return;

      const localCartItems: CartItem[] = JSON.parse(localCart);
      const cartId = localStorage.getItem("cartId");
      if (!cartId) {
        throw new Error("Cart ID not found");
      }

      // Xử lý từng sản phẩm trong giỏ hàng local
      for (const localItem of localCartItems) {
        // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng server chưa
        const existingItem = cartItems.find(item => item.product_detail.id === localItem.product_detail.id);
        
        if (existingItem) {
          // Nếu đã tồn tại, cập nhật số lượng
          const newQuantity = existingItem.quantity + localItem.quantity;
          await cartApi.update(existingItem.id, {
            product_detail_id: existingItem.product_detail_id,
            quantity: newQuantity
          });
        } else {
          // Nếu chưa tồn tại, thêm mới
          const request: CartDetailRequest = {
            cart_id: parseInt(cartId),
            product_detail_id: localItem.product_detail_id,
            quantity: localItem.quantity
          };
          await cartApi.create(request);
        }
      }

      // Sau khi đã chuyển đổi thành công, cập nhật lại giỏ hàng từ server
      const updatedCartResponse = await cartApi.findOne(parseInt(cartId));
      // Assuming findOne returns the CartDetail object directly in response.data
      const updatedCart = updatedCartResponse.data; 

      // Cập nhật state với dữ liệu mới từ server
      // Ensure updatedCart is an array if setCart expects an array
      // If findOne returns a single CartDetail, and you need the list, you might need to adjust logic or API response
      // Assuming updatedCartResponse.data IS the list of CartDetail items
      const updatedList = Array.isArray(updatedCartResponse.data) ? updatedCartResponse.data : [];
      setCart(updatedList); 
      setCartItems(updatedList); // Pass the array directly

      // Xóa giỏ hàng local sau khi đã chuyển đổi thành công
      localStorage.removeItem('localCart');
      toast.success("Đã chuyển giỏ hàng tạm thời vào giỏ hàng chính!");
    } catch (err) {
      setError('Error migrating local cart to server');
      console.error('Error migrating cart:', err);
      toast.error("Không thể chuyển giỏ hàng tạm thời vào giỏ hàng chính!");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productDetailId: number, quantity: number, cartItem?: CartItem) => {
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
        const newItem = response.data; // Assuming response.data is the new CartDetail item
        setCart(prevCart => [...prevCart, newItem]);
        // Update cartItems by passing the new array directly
        setCartItems([...cartItems, newItem]); 
      } else {
        // Nếu chưa đăng nhập, thêm vào localStorage với thông tin đầy đủ
        if (!cartItem) {
          throw new Error("Cart item information is required for unauthenticated users");
        }
        setCart(prevCart => [...prevCart, cartItem]);
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
        const updatedLocalCart = cart.filter(item => item.id !== id);
        setCart(updatedLocalCart);
        // Update cartItems by passing the new array directly
        setCartItems(cartItems.filter((item: CartDetail) => item.id !== id)); 
      } else {
        // Nếu chưa đăng nhập, xóa khỏi localStorage
        setCart(prevCart => prevCart.filter(item => item.id !== id));
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
        const updatedLocalCartOnUpdate = cart.map(item =>
            item.id === id ? { ...item, quantity } : item
          );
        setCart(updatedLocalCartOnUpdate);
        // Update cartItems by passing the new array directly
        setCartItems(cartItems.map((item: CartDetail) => 
            item.id === id ? { ...item, quantity } : item
          ));
      } else {
        // Nếu chưa đăng nhập, cập nhật trong localStorage
        setCart(prevCart =>
          prevCart.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        );
      }
    } catch (err) {
      setError('Error updating cart quantity');
      console.error('Error updating quantity:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      setCart,
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      migrateLocalCartToServer,
      resetCart,
      loading, 
      error 
    }}>
      {children}
    </CartContext.Provider>
  );
};
