import { AxiosResponse } from "axios";
import BaseApiService from "./BaseApiService";
import { ProductDetail } from "./ProductDetailApi";
import { toast } from "react-toastify";

// Interfaces
export interface SaveForLaterRequest {
  user_id: number;
  product_detail_id: number;
  cart_detail_id?: number;
}

export interface SaveForLaterResponse {
  id: number;
  user_id: number;
  product_detail_id: number;
  product_detail: ProductDetail;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

interface BaseListDataResponse<T> {
  list: T[];
  totalRecord: number;
}

// API Service Class
class SaveForLaterApi extends BaseApiService {
  constructor(token?: string) {
    super(token);
  }

  // Add to save for later
  async addToSaveForLater(request: SaveForLaterRequest): Promise<ApiResponse<SaveForLaterResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<SaveForLaterResponse>> = await this.api.post("/save-for-later", request);
      
      if (response.data.status === 400) {
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get user's save for later list
  async getSaveForLaterByUserId(userId: number): Promise<ApiResponse<SaveForLaterResponse[]>> {
    try {
      const response: AxiosResponse<ApiResponse<SaveForLaterResponse[]>> = await this.api.get(`/save-for-later/user/${userId}`);
      
      if (response.data.status === 400) {
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Remove from save for later
  async removeFromSaveForLater(userId: number, productDetailId: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/save-for-later/${userId}/${productDetailId}`);
      
      if (response.data.status === 400) {
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Move to cart
  async moveToCart(userId: number, productDetailId: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await this.api.post(`/save-for-later/${userId}/${productDetailId}/move-to-cart`);
      
      if (response.data.status === 400) {
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
const token = localStorage.getItem("token") || undefined;
const saveForLaterApi = new SaveForLaterApi(token);
export default saveForLaterApi; 