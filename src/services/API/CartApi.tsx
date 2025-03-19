import { AxiosResponse } from "axios";
import BaseApiService from "./BaseApiService";
import { toast } from "react-toastify";

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
    private token: string | null;
    constructor(token?: string) {
        super(token);
        this.token = token || null;
    }

    public setToken(token: string | null) {
        this.token = token;
        this.updateAuthorizationHeader();
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
            
            if (response.data.status === 400) {
                toast.error(response.data.message || "Không thể lấy danh sách giỏ hàng");
                throw new Error(response.data.message);
            }
            
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    // Fetch a single cart detail by ID
    async findOne(id: number): Promise<ApiResponse<CartDetail>> {
        try {
            const response: AxiosResponse<ApiResponse<CartDetail>> = await this.api.get(`/cart-detail/${id}`);
            
            if (response.data.status === 400) {
                toast.error(response.data.message || "Không thể lấy thông tin sản phẩm trong giỏ hàng");
                throw new Error(response.data.message);
            }
            
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    // Create a new cart detail
    async create(data: CartDetailRequest): Promise<ApiResponse<CartDetail>> {
        try {
            const response: AxiosResponse<ApiResponse<CartDetail>> = await this.api.post("/cart-detail/create", data);
            
            if (response.data.status === 400) {
                toast.error(response.data.message || "Không thể thêm sản phẩm vào giỏ hàng");
                throw new Error(response.data.message);
            }
            
            toast.success("Thêm sản phẩm vào giỏ hàng thành công");
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    // Update an existing cart detail
    async update(id: number, data: CartDetailRequest): Promise<ApiResponse<CartDetail>> {
        try {
            const response: AxiosResponse<ApiResponse<CartDetail>> = await this.api.post(`/cart-detail/${id}/update`, data);
            
            if (response.data.status === 400) {
                toast.error(response.data.message || "Không thể cập nhật giỏ hàng");
                throw new Error(response.data.message);
            }
            
            if (data.quantity === 0) {
                toast.success("Xóa sản phẩm khỏi giỏ hàng thành công");
            } else {
                toast.success("Cập nhật số lượng sản phẩm thành công");
            }
            return response.data;
        } catch (error: any) {
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
const cartApi = new CartApi(token);
export default cartApi;
