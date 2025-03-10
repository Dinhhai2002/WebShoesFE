import { AxiosResponse } from "axios";
import BaseApiService from "./BaseApiService";

export interface ProductDetail {
    id: number;
    name: string;
    product_id: number;
    color_id: number;
    color: string;
    size_id: number;
    size: string;
    material_id: number;
    material: string;
    price: number;
    stock: number;
    image_url: string;
    status: number;
}

interface ProductDetailQueryParams {
    product_id?: number;
    color_id?: number;
    size_id?: number;
    material_id?: number;
    key_search?: string;
    status?: number;
    page?: number;
    limit?: number;
}

interface ProductDetailListResponse {
    limit: number;
    list: ProductDetail[];
    total_record: number;
}

interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

class ProductDetailApi extends BaseApiService {
    constructor(token?: string) {
        super(token);
    }

    // Fetch all product details with filters and pagination
    async findAll(params: ProductDetailQueryParams): Promise<ApiResponse<ProductDetailListResponse>> {
        try {
            const response: AxiosResponse<ApiResponse<ProductDetailListResponse>> = await this.api.get("/product-detail", {
                params: {
                    product_id: params.product_id || -1,
                    color_id: params.color_id || -1,
                    size_id: params.size_id || -1,
                    material_id: params.material_id || -1,
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

    // Fetch a single product detail by ID
    async findOne(id: number): Promise<ApiResponse<ProductDetail>> {
        try {
            const response: AxiosResponse<ApiResponse<ProductDetail>> = await this.api.get(`/product-detail/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Change product detail status (active/inactive)
    async changeStatus(id: number): Promise<ApiResponse<ProductDetail>> {
        try {
            const response: AxiosResponse<ApiResponse<ProductDetail>> = await this.api.post(`/product-detail/${id}/change-status`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Create a new product detail
    async create(productDetail: {
        name: string;
        product_id: number;
        color_id: number;
        size_id: number;
        material_id: number;
        price: number;
        stock: number;
    }): Promise<ApiResponse<ProductDetail>> {
        try {
            const response: AxiosResponse<ApiResponse<ProductDetail>> = await this.api.post("/product-detail/create", productDetail);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Update an existing product detail
    async update(id: number, productDetail: {
        name: string;
        price: number;
        stock: number;
    }): Promise<ApiResponse<ProductDetail>> {
        try {
            const response: AxiosResponse<ApiResponse<ProductDetail>> = await this.api.post(`/product-detail/${id}/update`, productDetail);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

const token = localStorage.getItem("token") || undefined;
const productDetailApi = new ProductDetailApi(token);
export default productDetailApi; 