import { AxiosResponse } from "axios";
import BaseApiService from "./BaseApiService";
import { toast } from "react-toastify";

export interface Review {
    id: number;
    user_id: number;
    username: string;
    product_id: number;
    rating: number;
    comment: string;
    status: number;
    created_at: Date;
    updated_at: Date;
}

interface ReviewQueryParams {
    user_id?: number;
    product_id?: number;
    key_search?: string;
    status?: number;
    page: number;
    limit: number;
}

interface ReviewListResponse {
    limit: number;
    list: Review[];
    total_record: number;
}

interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

interface CreateReviewRequest {
    product_id: number;
    rating: number;
    comment: string;
}

class ReviewApi extends BaseApiService {
    constructor(token?: string) {
        super(token);
    }

    // Fetch all reviews with filters and pagination
    async findAll(params: ReviewQueryParams): Promise<ApiResponse<ReviewListResponse>> {
        try {
            const response: AxiosResponse<ApiResponse<ReviewListResponse>> = await this.api.get("/review", {
                params: {
                    user_id: params.user_id || -1,
                    product_id: params.product_id || -1,
                    key_search: params.key_search || "",
                    status: params.status || -1,
                    page: params.page,
                    limit: params.limit
                }
            });
            
            if (response.data.status === 400) {
                toast.error(response.data.message || "Không thể lấy danh sách đánh giá");
                throw new Error(response.data.message);
            }
            
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Fetch a single review by ID
    async findOne(id: number): Promise<ApiResponse<Review>> {
        try {
            const response: AxiosResponse<ApiResponse<Review>> = await this.api.get(`/review/${id}`);
            
            if (response.data.status === 400) {
                toast.error(response.data.message || "Không thể lấy thông tin đánh giá");
                throw new Error(response.data.message);
            }
            
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Create a new review
    async create(review: CreateReviewRequest): Promise<ApiResponse<Review>> {
        try {
            const response: AxiosResponse<ApiResponse<Review>> = await this.api.post("/review/create", review);
            
            if (response.data.status === 400) {
                toast.error(response.data.message || "Không thể tạo đánh giá");
                throw new Error(response.data.message);
            }
            
            toast.success("Đánh giá sản phẩm thành công");
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Change review status (active/inactive)
    async changeStatus(id: number): Promise<ApiResponse<Review>> {
        try {
            const response: AxiosResponse<ApiResponse<Review>> = await this.api.post(`/review/${id}/change-status`);
            
            if (response.data.status === 400) {
                toast.error(response.data.message || "Không thể thay đổi trạng thái đánh giá");
                throw new Error(response.data.message);
            }
            
            toast.success("Thay đổi trạng thái đánh giá thành công");
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

const token = localStorage.getItem("token") || undefined;
const reviewApi = new ReviewApi(token);
export default reviewApi; 