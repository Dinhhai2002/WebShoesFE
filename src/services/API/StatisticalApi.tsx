import { AxiosResponse } from "axios";
import BaseApiService from "./BaseApiService";

export interface WebsiteStatisticalResponse {
  total_users: number;
  total_revenue: number;
  total_products: number;
  total_orders: number;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

class StatisticalApi extends BaseApiService {
  constructor(token?: string) {
    super(token);
  }

  async getOverview(): Promise<ApiResponse<WebsiteStatisticalResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<WebsiteStatisticalResponse>> = await this.api.get("/statistical-overview");
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

const token = localStorage.getItem("token") || undefined;
const statisticalApi = new StatisticalApi(token);
export default statisticalApi;
