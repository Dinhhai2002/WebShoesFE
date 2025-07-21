import { AxiosResponse } from "axios";
import BaseApiService from "./BaseApiService";
import { toast } from "react-toastify";

// Interfaces
export interface ExchangeRequestRequest {
  return_request_id: number;
  exchange_reason: string;
  details: ExchangeRequestDetailRequest[];
}

export interface ExchangeRequestDetailRequest {
  old_product_detail_id: number;
  new_product_detail_id?: number;
  quantity: number;
  exchange_reason: string;
  condition_description: string;
  images: string[];
}

export interface ExchangeRequestResponse {
  id: number;
  return_request_id: number;
  exchange_reason: string;
  status: string;
  admin_notes?: string;
  price_difference?: number;
  created_at: string;
  updated_at: string;
  details: ExchangeRequestDetailResponse[];
}

export interface ExchangeRequestDetailResponse {
  id: number;
  exchange_request_id: number;
  old_product_detail_id: number;
  new_product_detail_id?: number;
  quantity: number;
  exchange_reason: string;
  condition_description: string;
  images: string[];
  old_product_detail?: {
    id: number;
    name: string;
    image_url: string;
    color: string;
    size: string;
    material: string;
    price: number;
  };
  new_product_detail?: {
    id: number;
    name: string;
    image_url: string;
    color: string;
    size: string;
    material: string;
    price: number;
  };
}

export interface ApproveExchangeRequestRequest {
  admin_notes?: string;
  price_difference?: number;
  exchange_products: ExchangeProductRequest[];
}

export interface ExchangeProductRequest {
  old_product_detail_id: number;
  new_product_detail_id: number;
  quantity: number;
  exchange_reason: string;
}

export interface RejectExchangeRequestRequest {
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
class ExchangeRequestApi extends BaseApiService {
  constructor(token?: string) {
    super(token);
  }

  // Create exchange request
  async createExchangeRequest(request: ExchangeRequestRequest): Promise<ApiResponse<ExchangeRequestResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<ExchangeRequestResponse>> = await this.api.post("/exchange-requests", request);
      
      if (response.data.status !== 200) {
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get exchange request by ID
  async getExchangeRequestById(id: number): Promise<ApiResponse<ExchangeRequestResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<ExchangeRequestResponse>> = await this.api.get(`/exchange-requests/${id}`);
      
      if (response.data.status === 400) {
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get exchange request by return request ID
  async getExchangeRequestByReturnRequestId(returnRequestId: number): Promise<ApiResponse<ExchangeRequestResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<ExchangeRequestResponse>> = await this.api.get(`/exchange-requests/return-request/${returnRequestId}`);
      
      if (response.data.status === 400) {
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Admin: Get all exchange requests
  async getAllExchangeRequests(): Promise<ApiResponse<ExchangeRequestResponse[]>> {
    try {
      const response: AxiosResponse<ApiResponse<ExchangeRequestResponse[]>> = await this.api.get("/exchange-requests/admin");
      
      if (response.data.status === 400) {
        toast.error(response.data.message || "Không thể lấy danh sách yêu cầu đổi hàng");
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Admin: Approve exchange request
  async approveExchangeRequest(id: number, request: ApproveExchangeRequestRequest): Promise<ApiResponse<ExchangeRequestResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<ExchangeRequestResponse>> = await this.api.post(`/exchange-requests/${id}/approve`, request);
      
      if (response.data.status === 400) {
        toast.error(response.data.message || "Không thể duyệt yêu cầu đổi hàng");
        throw new Error(response.data.message);
      }
      
      toast.success("Duyệt yêu cầu đổi hàng thành công");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Admin: Reject exchange request
  async rejectExchangeRequest(id: number, request: RejectExchangeRequestRequest): Promise<ApiResponse<ExchangeRequestResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<ExchangeRequestResponse>> = await this.api.post(`/exchange-requests/${id}/reject`, request);
      
      if (response.data.status === 400) {
        toast.error(response.data.message || "Không thể từ chối yêu cầu đổi hàng");
        throw new Error(response.data.message);
      }
      
      toast.success("Từ chối yêu cầu đổi hàng thành công");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Admin: Process exchange request
  async processExchangeRequest(id: number): Promise<ApiResponse<ExchangeRequestResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<ExchangeRequestResponse>> = await this.api.post(`/exchange-requests/${id}/process`);
      
      if (response.data.status === 400) {
        toast.error(response.data.message || "Không thể bắt đầu xử lý yêu cầu đổi hàng");
        throw new Error(response.data.message);
      }
      
      toast.success("Bắt đầu xử lý yêu cầu đổi hàng thành công");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Admin: Complete exchange request
  async completeExchangeRequest(id: number): Promise<ApiResponse<ExchangeRequestResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<ExchangeRequestResponse>> = await this.api.post(`/exchange-requests/${id}/complete`);
      
      if (response.data.status === 400) {
        toast.error(response.data.message || "Không thể hoàn thành yêu cầu đổi hàng");
        throw new Error(response.data.message);
      }
      
      toast.success("Hoàn thành yêu cầu đổi hàng thành công");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Cancel exchange request
  async cancelExchangeRequest(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await this.api.post(`/exchange-requests/${id}/cancel`);
      
      if (response.data.status === 400) {
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Delete exchange request
  async deleteExchangeRequest(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await this.api.post(`/exchange-requests/${id}/deleted`);
      
      if (response.data.status === 400) {
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Upload image for exchange request detail
  async uploadExchangeRequestImage(file: File, id: number): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response: AxiosResponse<{ status: number; message: string; data: string }> = await this.api.post(`/exchange-requests/${id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.status !== 200) {
        throw new Error(response.data.message || 'Không thể upload ảnh');
      }
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
const token = localStorage.getItem("token") || undefined;
const exchangeRequestApi = new ExchangeRequestApi(token);
export default exchangeRequestApi; 