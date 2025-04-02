import { AxiosResponse } from "axios";
import BaseApiService from "./BaseApiService";
import handleResponseApi from "../handleResponseApi/handleResponseApi";

// Types
export interface Voucher {
  id: number;
  code: string;
  discount_type: number;
  discount_value: number;
  min_order_value: number;
  max_discount: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  used_count: number;
  status: number;
}

interface VoucherQueryParams {
  key_search?: string;
  status?: number;
  page?: number;
  limit?: number;
}

interface VoucherListResponse {
  limit: number;
  list: Voucher[];
  total_record: number;
}

interface ApplyVoucherRequest {
  total_amount: number;
}

export interface ApplyVoucherResponse {
  total_amount: number;
  amount_voucher: number;
  voucher : Voucher;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

class VoucherApi extends BaseApiService {
  constructor(token?: string) {
    super(token);
  }

  // Fetch all vouchers with search, status filter and pagination
  async findAll(params: VoucherQueryParams): Promise<ApiResponse<VoucherListResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<VoucherListResponse>> = await this.api.get("/voucher", {
        params: {
          key_search: params.key_search,
          status: params.status,
          page: params.page,
          limit: params.limit
        }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Fetch a single voucher by ID
  async findOne(id: number): Promise<ApiResponse<Voucher>> {
    try {
      const response: AxiosResponse<ApiResponse<Voucher>> = await this.api.get(`/voucher/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Change voucher status (active/inactive)
  async changeStatus(id: number): Promise<ApiResponse<Voucher>> {
    try {
      const response: AxiosResponse<ApiResponse<Voucher>> = await this.api.post(`/voucher/${id}/change-status`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Create a new voucher
  async create(voucher: Omit<Voucher, 'id'>): Promise<ApiResponse<Voucher>> {
    try {
      const response: AxiosResponse<ApiResponse<Voucher>> = await this.api.post("/voucher/create", voucher);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Update an existing voucher
  async update(id: number, voucher: Partial<Voucher>): Promise<ApiResponse<Voucher>> {
    try {
      const response: AxiosResponse<ApiResponse<Voucher>> = await this.api.post(`/voucher/${id}/update`, voucher);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Apply voucher
  async apply(id: number, data: ApplyVoucherRequest): Promise<ApiResponse<ApplyVoucherResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<ApplyVoucherResponse>> = await this.api.post(`/voucher/${id}/apply`, data);
      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get best voucher
  async getBestVoucher(): Promise<ApiResponse<ApplyVoucherResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<ApplyVoucherResponse>> = await this.api.get("/voucher/best-voucher");
      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

const token = localStorage.getItem("token") || undefined;
const voucherApi = new VoucherApi(token);
export default voucherApi;
