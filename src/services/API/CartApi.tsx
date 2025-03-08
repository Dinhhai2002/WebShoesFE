import { AxiosResponse } from "axios";
import BaseApiService from "./BaseApiService";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  // Add other relevant fields
}

class CartApi extends BaseApiService {
  constructor(token?: string) {
    super(token);
  }

  // Fetch all items in the cart
  async getCartItems(): Promise<CartItem[]> {
    try {
      const response: AxiosResponse<CartItem[]> = await this.api.get("/cart");
      return response.data;
    } catch (error) {
      // Handle error appropriately
      throw error;
    }
  }

  // Add a new item to the cart
  async addItemToCart(item: CartItem): Promise<CartItem> {
    try {
      const response: AxiosResponse<CartItem> = await this.api.post("/cart", item);
      return response.data;
    } catch (error) {
      // Handle error appropriately
      throw error;
    }
  }

  // Update an existing cart item
  async updateCartItem(itemId: number, item: Partial<CartItem>): Promise<CartItem> {
    try {
      const response: AxiosResponse<CartItem> = await this.api.put(`/cart/${itemId}`, item);
      return response.data;
    } catch (error) {
      // Handle error appropriately
      throw error;
    }
  }

  // Remove an item from the cart
  async removeCartItem(itemId: number): Promise<void> {
    try {
      await this.api.delete(`/cart/${itemId}`);
    } catch (error) {
      // Handle error appropriately
      throw error;
    }
  }
}
const token = localStorage.getItem("token");
const cartApi = new CartApi(token);
export default cartApi;
