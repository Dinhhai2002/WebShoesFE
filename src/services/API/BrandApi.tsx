import { AxiosResponse } from "axios";
import BaseApiService from "./BaseApiService";

export interface Brand {
    id: number;
    name: string;
    image_url: string;
    status: number;
}

interface BrandQueryParams {
    key_search?: string;
    status?: number;
    page?: number;
    limit?: number;
}

interface BrandListResponse {
    limit: number;
    list: Brand[];
    total_record: number;
}

interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

export interface CRUDBrandRequest {
    name: string;
}

class BrandApi extends BaseApiService {
    constructor(token?: string) {
        super(token);
    }

    // Fetch all brands with search, status filter and pagination
    async findAll(params: BrandQueryParams = {}): Promise<ApiResponse<BrandListResponse>> {
        try {
            const response: AxiosResponse<ApiResponse<BrandListResponse>> = await this.api.get("/brand", {
                params: {
                    key_search: params.key_search || "",
                    status: params.status || -1,
                    page: params.page || 1,
                    limit: params.limit || 10
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Fetch a single brand by ID
    async findOne(id: number): Promise<ApiResponse<Brand>> {
        try {
            const response: AxiosResponse<ApiResponse<Brand>> = await this.api.get(`/brand/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Change brand status (active/inactive)
    async changeStatus(id: number): Promise<ApiResponse<Brand>> {
        try {
            const response: AxiosResponse<ApiResponse<Brand>> = await this.api.post(`/brand/${id}/change-status`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Create a new brand
    async create(brand: CRUDBrandRequest): Promise<ApiResponse<Brand>> {
        try {
            const response: AxiosResponse<ApiResponse<Brand>> = await this.api.post("/brand/create", brand);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Update an existing brand
    async update(id: number, brand: CRUDBrandRequest): Promise<ApiResponse<Brand>> {
        try {
            const response: AxiosResponse<ApiResponse<Brand>> = await this.api.post(`/brand/${id}/update`, brand);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

const token = localStorage.getItem("token") || undefined;
const brandApi = new BrandApi(token);
export default brandApi; 