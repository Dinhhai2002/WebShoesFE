import { AxiosResponse } from "axios";
import BaseApiService from "./BaseApiService";

export interface Category {
    id: number;
    name: string;
    parent_id: number;
    status: number;
}

interface CategoryQueryParams {
    keySearch: string;
    status: number;
    page: number;
    limit: number;
}

interface CategoryListResponse {
    limit: number;
    list: Category[];
    total_record: number;
}

interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

class CategoryApi extends BaseApiService {
    constructor(token?: string) {
        super(token);
    }

    // Fetch all categories with search, status filter and pagination
    async findAll(params: CategoryQueryParams): Promise<ApiResponse<CategoryListResponse>> {
        try {
            const response: AxiosResponse<ApiResponse<CategoryListResponse>> = await this.api.get("/category", {
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

    // Fetch a single category by ID
    async findOne(id: number): Promise<ApiResponse<Category>> {
        try {
            const response: AxiosResponse<ApiResponse<Category>> = await this.api.get(`/category/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Change category status (active/inactive)
    async changeStatus(id: number, status: number): Promise<ApiResponse<Category>> {
        try {
            const response: AxiosResponse<ApiResponse<Category>> = await this.api.post(`/category/${id}/change-status`, { status });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Create a new category
    async create(category: Omit<Category, 'id'>): Promise<ApiResponse<Category>> {
        try {
            const response: AxiosResponse<ApiResponse<Category>> = await this.api.post("/category/create", category);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Update an existing category
    async update(id: number, category: Partial<Category>): Promise<ApiResponse<Category>> {
        try {
            const response: AxiosResponse<ApiResponse<Category>> = await this.api.post(`/category/${id}/update`, category);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Get categories by parent ID
    async getByParentId(parentId: number): Promise<ApiResponse<Category[]>> {
        try {
            const response: AxiosResponse<ApiResponse<Category[]>> = await this.api.get(`/category/parent/${parentId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

const token = localStorage.getItem("token") || undefined;
const categoryApi = new CategoryApi(token);
export default categoryApi; 