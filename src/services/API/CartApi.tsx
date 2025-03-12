import { AxiosResponse } from "axios";
import BaseApiService from "./BaseApiService";

export interface CartDetail {
    id: number;
    cart_id: number;
    product_detail_id: number;
    quantity: number;
    product_detail: {
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
    };
}

export interface CartDetailRequest {
    cart_id?: number;
    product_detail_id: number;
    quantity: number;
}

export interface CartDetailListResponse {
    list: CartDetail[];
    total_record: number;
}

export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

class CartApi extends BaseApiService {
    constructor(token?: string) {
        super(token);
    }

    // Fetch all cart details with search, status filter and pagination
    async findAll(params?: {
        cart_id?: number;
        key_search?: string;
        status?: number;
        page?: number;
        limit?: number;
    }): Promise<ApiResponse<CartDetailListResponse>> {
        try {
            const response: AxiosResponse<ApiResponse<CartDetailListResponse>> = await this.api.get("/cart-detail", {
                params: {
                    cart_id: params?.cart_id,
                    key_search: params?.key_search,
                    status: params?.status,
                    page: params?.page,
                    limit: params?.limit
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Fetch a single cart detail by ID
    async findOne(id: number): Promise<ApiResponse<CartDetail>> {
        try {
            const response: AxiosResponse<ApiResponse<CartDetail>> = await this.api.get(`/cart-detail/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Create a new cart detail
    async create(data: CartDetailRequest): Promise<ApiResponse<CartDetail>> {
        try {
            const response: AxiosResponse<ApiResponse<CartDetail>> = await this.api.post("/cart-detail/create", data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Update an existing cart detail
    async update(id: number, data: CartDetailRequest): Promise<ApiResponse<CartDetail>> {
        try {
            const response: AxiosResponse<ApiResponse<CartDetail>> = await this.api.post(`/cart-detail/${id}/update`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

const token = localStorage.getItem("token") || undefined;
const cartApi = new CartApi(token);
export default cartApi;
