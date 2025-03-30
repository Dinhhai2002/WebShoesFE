import { AxiosResponse } from "axios";
import BaseApiService from "./BaseApiService";

export interface Product {
    id: number;
    name: string;
    brand_id: number;
    category_id: number;
    description: string | null;
    price: number;
    average_rating: number;
    image_url: string | null;
    status: number;
    images: string[];
}

interface ProductQueryParams {
    keySearch: string;
    status: number;
    page: number;
    limit: number;
}

interface ProductListResponse {
    limit: number;
    list: Product[];
    total_record: number;
}

interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

class ProductApi extends BaseApiService {
    constructor(token?: string) {
        super(token);
    }

    // Fetch all products with search, status filter and pagination
    async findAll(params: ProductQueryParams): Promise<ApiResponse<ProductListResponse>> {
        try {
            const response: AxiosResponse<ApiResponse<ProductListResponse>> = await this.api.get("/product", {
                params: {
                    key_search: params.keySearch,
                    status: params.status,
                    page: params.page,
                    limit: params.limit
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Fetch a single product by ID
    async findOne(id: number): Promise<ApiResponse<Product>> {
        try {
            const response: AxiosResponse<ApiResponse<Product>> = await this.api.get(`/product/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Change product status (active/inactive)
    async changeStatus(id: number, status: number): Promise<ApiResponse<Product>> {
        try {
            const response: AxiosResponse<ApiResponse<Product>> = await this.api.post(`/product/${id}/change-status`, { status });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Create a new product
    async create(product: Omit<Product, 'id'>): Promise<ApiResponse<Product>> {
        try {
            const response: AxiosResponse<ApiResponse<Product>> = await this.api.post("/product/create", product);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Update an existing product
    async update(id: number, product: Partial<Product>): Promise<ApiResponse<Product>> {
        try {
            const response: AxiosResponse<ApiResponse<Product>> = await this.api.post(`/product/${id}/update`, product);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

const token = localStorage.getItem("token") || undefined;
const productApi = new ProductApi(token);
export default productApi; 