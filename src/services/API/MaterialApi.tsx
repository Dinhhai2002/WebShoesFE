import { AxiosResponse } from "axios";
import BaseApiService from "./BaseApiService";

export interface Material {
    id: number;
    name: string;
    status: number;
}

interface MaterialListResponse {
    limit: number;
    list: Material[];
    total_record: number;
}

interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

class MaterialApi extends BaseApiService {
    constructor(token?: string) {
        super(token);
    }

    // Fetch all materials with pagination
    async findAll(params: {
        key_search?: string;
        status?: number;
        page?: number;
        limit?: number;
    }): Promise<ApiResponse<MaterialListResponse>> {
        try {
            const response: AxiosResponse<ApiResponse<MaterialListResponse>> = await this.api.get("/materials", {
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

    // Fetch a single material by ID
    async findOne(id: number): Promise<ApiResponse<Material>> {
        try {
            const response: AxiosResponse<ApiResponse<Material>> = await this.api.get(`/materials/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Change material status (active/inactive)
    async changeStatus(id: number): Promise<ApiResponse<Material>> {
        try {
            const response: AxiosResponse<ApiResponse<Material>> = await this.api.post(`/materials/${id}/change-status`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Create a new material
    async create(material: {
        name: string;
    }): Promise<ApiResponse<Material>> {
        try {
            const response: AxiosResponse<ApiResponse<Material>> = await this.api.post("/materials/create", material);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Update an existing material
    async update(id: number, material: {
        name: string;
    }): Promise<ApiResponse<Material>> {
        try {
            const response: AxiosResponse<ApiResponse<Material>> = await this.api.post(`/materials/${id}/update`, material);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

const token = localStorage.getItem("token") || undefined;
const materialApi = new MaterialApi(token);
export default materialApi; 