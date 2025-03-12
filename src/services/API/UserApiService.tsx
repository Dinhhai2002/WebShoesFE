import { AxiosResponse } from "axios";
import handleResponseApi from "../handleResponseApi/handleResponseApi";
import BaseApiService from "./BaseApiService";

export interface UserResponse {
    id: number;
    user_name: string;
    full_name: string;
    email: string;
    avatar_id: number;
    avatar_url: string;
    phone: string;
    gender: number;
    birthday: string;
    ward_id: number;
    city_id: number;
    district_id: number;
    full_address: string;
    access_token: string;
    is_login: number;
    role: number;
    is_active: number;
    is_google: number;
    point_promotion: number;
    cart_id: number;
}

export interface UserListResponse {
    list: UserResponse[];
    total_record: number;
}

export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

export interface UpdateUserRequest {
    full_name: string;
    email: string;
    phone: string;
    full_address: string;
}

export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
    confirm_password: string;
}

class UserApiService extends BaseApiService {
    private token: string | null;

    constructor(token?: string) {
        super(token);
        this.token = token || null;
    }

    public setToken(token: string | null) {
        this.token = token;
        this.updateAuthorizationHeader();
    }

    // Get all users with search, status filter and pagination
    public async getAllUsers(params?: {
        key_search?: string;
        status?: number;
        role?: number;
        page?: number;
        limit?: number;
    }): Promise<ApiResponse<UserListResponse>> {
        try {
            const response: AxiosResponse<ApiResponse<UserListResponse>> = await this.api.get("/users", {
                params: {
                    key_search: params?.key_search,
                    status: params?.status,
                    role: params?.role,
                    page: params?.page,
                    limit: params?.limit
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Get current user details
    public async getUser(): Promise<ApiResponse<UserResponse>> {
        try {
            const response: AxiosResponse<ApiResponse<UserResponse>> = await this.api.get("/users/detail");
            return response.data;
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    }

    // Update user profile
    public async update(data: UpdateUserRequest): Promise<ApiResponse<UserResponse>> {
        try {
            const response: AxiosResponse<ApiResponse<UserResponse>> = await this.api.post("/users/update", data);
            handleResponseApi.handleResponse(response);
            return response.data;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Change password
    public async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<UserResponse>> {
        try {
            const response: AxiosResponse<ApiResponse<UserResponse>> = await this.api.post("/users/change-password", data);
            handleResponseApi.handleResponse(response);
            return response.data;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Upload avatar
    public async uploadAvatar(file: File): Promise<ApiResponse<{ id: number; url: string }>> {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response: AxiosResponse<ApiResponse<{ id: number; url: string }>> = await this.api.post("/users/upload-avatar", formData);
            return response.data;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw error;
        }
    }

    // Change user status (admin only)
    public async changeStatus(id: number): Promise<ApiResponse<UserResponse>> {
        try {
            const response: AxiosResponse<ApiResponse<UserResponse>> = await this.api.post(`/users/${id}/change-status`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    private updateAuthorizationHeader() {
        if (this.token) {
            this.api.defaults.headers["Authorization"] = `Bearer ${this.token}`;
        } else {
            delete this.api.defaults.headers["Authorization"];
        }
    }
}

const token = localStorage.getItem("token") || undefined;
const userApiService = new UserApiService(token);
export default userApiService;
