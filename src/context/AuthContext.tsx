import { createContext, useContext, useEffect, useState } from "react";
import cartApi from "../services/API/CartApi";
import { CartDetail } from "../services/API/CartApi";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
    cartItems: CartDetail[];
    setCartItems: (items: CartDetail[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [cartItems, setCartItems] = useState<CartDetail[]>([]);

    // Fetch cart data when authentication status changes
    const fetchCartData = async (token: string | null) => {
        try {
            if (token) {
                // If user is authenticated, get cartId from localStorage and fetch cart from API
                const cartId = localStorage.getItem("cartId");
                if (cartId) {
                    cartApi.setToken(token);
                    const response = await cartApi.findAll({ cart_id: parseInt(cartId) });
                    setCartItems(response.data.list || []);

                    // Transfer local cart to server if exists
                    const localCart = localStorage.getItem('localCart');
                    if (localCart) {
                        const localCartItems = JSON.parse(localCart);
                        for (const item of localCartItems) {
                            try {
                                await cartApi.create({
                                    cart_id: parseInt(cartId),
                                    product_detail_id: item.product_detail_id,
                                    quantity: item.quantity
                                });
                            } catch (error) {
                                console.error('Error transferring cart item:', error);
                            }
                        }
                        // Clear local cart after successful transfer
                        localStorage.removeItem('localCart');
                    }
                } else {
                    setCartItems([]);
                }
            } else {
                // If user is not authenticated, clear cart items
                setCartItems([]);
            }
        } catch (error) {
            console.error("Error fetching cart data:", error);
            setCartItems([]);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
        // Only fetch cart data if user is authenticated
        if (token) {
            fetchCartData(token);
        }
    }, []);

    const login = (token: string) => {
        localStorage.setItem("token", token);
        setIsAuthenticated(true);
        // Fetch cart data after successful login
        fetchCartData(token);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("cartId");
        setIsAuthenticated(false);
        setCartItems([]);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, cartItems, setCartItems }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook để sử dụng AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
