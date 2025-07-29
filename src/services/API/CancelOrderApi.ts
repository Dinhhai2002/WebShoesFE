import { AxiosResponse } from "axios";
import BaseApiService from "./BaseApiService";
import { toast } from "react-toastify";

// Interfaces
export interface CancelOrderRequest {
  order_id: number;
  user_id: number;
  cancel_reason: string;
}

export interface CancelOrderResponse {
  id: number;
  order_id: number;
  user_id: number;
  cancel_reason: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ApproveCancelOrderRequest {
  admin_notes?: string;
}

export interface RejectCancelOrderRequest {
  admin_notes?: string;
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
class CancelOrderApi extends BaseApiService {
  constructor(token?: string) {
    super(token);
  }

  // Get all cancel requests with filtering and pagination
  async getAll(params: {
    user_id?: number;
    key_search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<BaseListDataResponse<CancelOrderResponse>>> {
    try {
      const response: AxiosResponse<ApiResponse<BaseListDataResponse<CancelOrderResponse>>> = await this.api.get("/cancel-orders", { params });
      
      if (response.data.status === 400) {
        toast.error(response.data.message || "Không thể lấy danh sách yêu cầu hủy đơn hàng");
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Create cancel request
  async createCancelRequest(request: CancelOrderRequest): Promise<ApiResponse<CancelOrderResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<CancelOrderResponse>> = await this.api.post("/cancel-orders", request);
      
      if (response.data.status !== 200) {
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get cancel request by ID
  async getCancelRequestById(id: number): Promise<ApiResponse<CancelOrderResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<CancelOrderResponse>> = await this.api.get(`/cancel-orders/${id}`);
      
      if (response.data.status === 400) {
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get cancel request by order ID
  async getCancelRequestByOrderId(orderId: number): Promise<ApiResponse<CancelOrderResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<CancelOrderResponse>> = await this.api.get(`/cancel-orders/order/${orderId}`);
      
      if (response.data.status === 400) {
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get user cancel requests
  async getCancelRequestsByUserId(userId: number): Promise<ApiResponse<CancelOrderResponse[]>> {
    try {
      const response: AxiosResponse<ApiResponse<CancelOrderResponse[]>> = await this.api.get(`/cancel-orders/user/${userId}`);
      
      if (response.data.status === 400) {
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get cancel requests by status
  async getCancelRequestsByStatus(status: string): Promise<ApiResponse<CancelOrderResponse[]>> {
    try {
      const response: AxiosResponse<ApiResponse<CancelOrderResponse[]>> = await this.api.get(`/cancel-orders/status/${status}`);
      
      if (response.data.status === 400) {
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Admin: Get all cancel requests
  async getAllCancelRequests(status?: string): Promise<ApiResponse<CancelOrderResponse[]>> {
    try {
      const params = status ? { status } : {};
      const response: AxiosResponse<ApiResponse<CancelOrderResponse[]>> = await this.api.get("/cancel-orders/admin", { params });
      
      if (response.data.status === 400) {
        toast.error(response.data.message || "Không thể lấy danh sách yêu cầu hủy đơn hàng");
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Admin: Approve cancel request
  async approveCancelRequest(id: number, request: ApproveCancelOrderRequest): Promise<ApiResponse<CancelOrderResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<CancelOrderResponse>> = await this.api.post(`/cancel-orders/${id}/approve`, request);
      
      if (response.data.status === 400) {
        toast.error(response.data.message || "Không thể duyệt yêu cầu hủy đơn hàng");
        throw new Error(response.data.message);
      }
      
      toast.success("Duyệt yêu cầu hủy đơn hàng thành công");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Admin: Reject cancel request
  async rejectCancelRequest(id: number, request: RejectCancelOrderRequest): Promise<ApiResponse<CancelOrderResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<CancelOrderResponse>> = await this.api.post(`/cancel-orders/${id}/reject`, request);
      
      if (response.data.status === 400) {
        toast.error(response.data.message || "Không thể từ chối yêu cầu hủy đơn hàng");
        throw new Error(response.data.message);
      }
      
      toast.success("Từ chối yêu cầu hủy đơn hàng thành công");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Delete cancel request
  async deleteCancelRequest(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/cancel-orders/${id}`);
      
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
const cancelOrderApi = new CancelOrderApi(token);
export default cancelOrderApi; 