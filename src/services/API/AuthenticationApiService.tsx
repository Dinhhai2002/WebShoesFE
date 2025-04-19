import handleResponseApi from "../handleResponseApi/handleResponseApi";
import BaseApiService from "./BaseApiService";
import { Banner } from "./BannerApi";
import { Category } from "./CategoryApi";
import { Brand } from "./BrandApi";
import { Product } from "./ProductApi";
import { Size } from "./SizeApi";
import { Material } from "./MaterialApi";
import { Color } from "./ColorApi";
import { ProductDetail } from "./ProductDetailApi";
import { OtpEnum } from "../../utils/enum/OtpEnum";
import { toast } from "react-toastify";

const prefix = "authentication";

interface ListResponse<T> {
  limit: number;
  list: T[];
  total_record: number;
}

interface ReviewResponse {
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

interface RegisterRequest {
  user_name: string;
  full_name: string;
  email: string;
  phone: string;
  password: string;
  gender: number;
  birthday: string;
  ward_id: number;
  district_id: number;
  city_id: number;
  full_address: string;
}

interface UserResponse {
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

interface CityResponse {
  id: number;
  country_id: number;
  name: string;
  code: string;
  status: number;
}

interface DistrictResponse {
  id: number;
  city_id: number;
  name: string;
  code: string;
  status: number;
}

interface WardResponse {
  id: number;
  district_id: number;
  name: string;
  code: string;
  status: number;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

interface OtpRegisterRequest {
  user_name: string;
  full_name: string;
  email: string;
  phone: string;
  password: string;
  gender: number;
  birthday: string;
  ward_id: number;
  district_id: number;
  city_id: number;
  full_address: string;
}

interface ProductDetailResponse {
  id: number;
  product_id: number;
  name: string;
  color_id: number;
  size_id: number;
  material_id: number;
  brand_id: number;
  category_id: number;
  quantity: number;
  price: number;
  discount: number;
  status: number;
  created_at: Date;
  updated_at: Date;
}

class AuthenticationApiService extends BaseApiService {
  public async Login(user_name: any, password: any): Promise<any> {
    try {
      const response = await this.api.post(
        `/authentication/login`,
        {
          user_name,
          password,
        }
      );

      if (response.data.status === 400) {
        toast.error(response.data.message || "Đăng nhập thất bại");
        throw new Error(response.data.message);
      }

      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  public async LoginGoogle(
    email: any,
    image_url: any,
    fullname: any
  ): Promise<any> {
    try {
      const response = await this.api.post(
        `/authentication/login-google`,
        {
          email,
          image_url,
          fullname,
        }
      );

      if (response.data.status === 400) {
        toast.error(response.data.message || "Đăng nhập Google thất bại");
        throw new Error(response.data.message);
      }

      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  public async Register(data: RegisterRequest): Promise<ApiResponse<UserResponse>> {
    try {
      const response = await this.api.post(
        `/authentication/register`,
        { ...data, role: 1 }
      );

      if (response.data.status === 400) {
        toast.error(response.data.message || "Đăng ký thất bại");
        throw new Error(response.data.message);
      }

      handleResponseApi.handleResponse(response);
      toast.success("Đăng ký thành công");
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  public async OtpRegister(data: OtpRegisterRequest): Promise<ApiResponse<number>> {
    try {
      const response = await this.api.post(
        `/${prefix}/otp-register`,
        { ...data, role: 1 }
      );

      if (response.data.status === 400) {
        toast.error(response.data.message || "Gửi mã OTP thất bại");
        throw new Error(response.data.message);
      }

      handleResponseApi.handleResponse(response);
      toast.success("Gửi mã OTP thành công");
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  public async OtpForgot(user_name: any, email: any): Promise<any> {
    try {
      const response: any = await this.api.post(
        `/authentication/otp`,
        {
          user_name,
          email,
        }
      );

      if (response.data.status === 400) {
        toast.error(response.data.message || "Gửi mã OTP thất bại");
        throw new Error(response.data.message);
      }

      handleResponseApi.handleResponse(response);
      toast.success("Gửi mã OTP thành công");
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  public async confirmOtp(
    user_name: string,
    email: string,
    otp: number,
    type: OtpEnum
  ): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post(`/${prefix}/confirm-otp`, {
        user_name,
        email,
        otp,
        type: type.valueOf()
      });

      if (response.data.status === 400) {
        toast.error(response.data.message || "Xác nhận OTP thất bại");
        throw new Error(response.data.message);
      }

      handleResponseApi.handleResponse(response);
      toast.success("Xác nhận OTP thành công");
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  public async resetPassword(
    user_name: any,
    new_password: any,
    confirm_password: any
  ): Promise<any> {
    try {
      const response: any = await this.api.post(
        `/authentication/reset-password`,
        {
          user_name,
          new_password,
          confirm_password,
        }
      );

      if (response.data.status === 400) {
        toast.error(response.data.message || "Đặt lại mật khẩu thất bại");
        throw new Error(response.data.message);
      }

      handleResponseApi.handleResponse(response);
      toast.success("Đặt lại mật khẩu thành công");
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  public async getAllCity(): Promise<ApiResponse<CityResponse[]>> {
    try {
      const response = await this.api.get(`/${prefix}/get-all-city`);

      if (response.data.status === 400) {
        toast.error(response.data.message || "Không thể tải danh sách tỉnh/thành phố");
        throw new Error(response.data.message);
      }

      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  public async findDistrictByCityId(id: number): Promise<ApiResponse<DistrictResponse[]>> {
    try {
      const response = await this.api.get(`/${prefix}/${id}/get-district-by-city`);

      if (response.data.status === 400) {
        toast.error(response.data.message || "Không thể tải danh sách quận/huyện");
        throw new Error(response.data.message);
      }

      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  public async findWardByDistrictId(id: number): Promise<ApiResponse<WardResponse[]>> {
    try {
      const response = await this.api.get(`/${prefix}/${id}/get-ward-by-district`);

      if (response.data.status === 400) {
        toast.error(response.data.message || "Không thể tải danh sách phường/xã");
        throw new Error(response.data.message);
      }

      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  // Fetch all banners
  async getBanners(params: {
    key_search?: string;
    status?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<ListResponse<Banner>>> {
    try {
      const response = await this.api.get(`/${prefix}/banners`, {
        params: {
          key_search: params.key_search || "",
          status: params.status || -1,
          page: params.page || 1,
          limit: params.limit || 10
        }
      });
      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Fetch all categories
  async getCategories(params: {
    parent_id?: number;
    key_search?: string;
    status?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<ListResponse<Category>>> {
    try {
      const response = await this.api.get(`/${prefix}/categories`, {
        params: {
          parent_id: params.parent_id || -1,
          key_search: params.key_search || "",
          status: params.status || -1,
          page: params.page || 1,
          limit: params.limit || 10
        }
      });
      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Fetch all brands
  async getBrands(params: {
    key_search?: string;
    status?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<ListResponse<Brand>>> {
    try {
      const response = await this.api.get(`/${prefix}/brands`, {
        params: {
          key_search: params.key_search || "",
          status: params.status || -1,
          page: params.page || 1,
          limit: params.limit || 10
        }
      });
      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Fetch all products
  async getProducts(params: {
    key_search?: string;
    status?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<ListResponse<Product>>> {
    try {
      const response = await this.api.get(`/${prefix}/products`, {
        params: {
          key_search: params.key_search || "",
          status: params.status || -1,
          page: params.page || 1,
          limit: params.limit || 10
        }
      });
      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Fetch all sizes
  async getSizes(params: {
    key_search?: string;
    status?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<ListResponse<Size>>> {
    try {
      const response = await this.api.get(`/${prefix}/sizes`, {
        params: {
          key_search: params.key_search || "",
          status: params.status || -1,
          page: params.page || 1,
          limit: params.limit || 10
        }
      });
      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Fetch all materials
  async getMaterials(params: {
    key_search?: string;
    status?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<ListResponse<Material>>> {
    try {
      const response = await this.api.get(`/${prefix}/materials`, {
        params: {
          key_search: params.key_search || "",
          status: params.status || -1,
          page: params.page || 1,
          limit: params.limit || 10
        }
      });
      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Fetch all colors
  async getColors(params: {
    key_search?: string;
    status?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<ListResponse<Color>>> {
    try {
      const response = await this.api.get(`/${prefix}/colors`, {
        params: {
          key_search: params.key_search || "",
          status: params.status || -1,
          page: params.page || 1,
          limit: params.limit || 10
        }
      });
      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Fetch all product details
  async getProductDetails(params: {
    product_id?: number;
    color_id?: number;
    size_id?: number;
    material_id?: number;
    brand_id?: number;
    category_id?: number;
    key_search?: string;
    status?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<ListResponse<ProductDetail>>> {
    try {
      const response = await this.api.get(`/${prefix}/product-details`, {
        params: {
          product_id: params.product_id || -1,
          color_id: params.color_id || -1,
          size_id: params.size_id || -1,
          material_id: params.material_id || -1,
          brand_id: params.brand_id || -1,
          category_id: params.category_id || -1,
          key_search: params.key_search || "",
          status: params.status || -1,
          page: params.page || 1,
          limit: params.limit || 10
        }
      });
      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Fetch product by ID
  async getProductById(id: number): Promise<ApiResponse<Product>> {
    try {
      const response = await this.api.get(`/${prefix}/products/${id}`);
      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getReviews(params: {
    user_id?: number;
    product_id?: number;
    key_search?: string;
    status?: number;
    page: number;
    limit: number;
  }): Promise<ApiResponse<ListResponse<ReviewResponse>>> {
    try {
      const response = await this.api.get(`/${prefix}/reviews`, {
        params: {
          user_id: params.user_id || -1,
          product_id: params.product_id || -1,
          key_search: params.key_search || "",
          status: params.status || -1,
          page: params.page,
          limit: params.limit
        }
      });

      handleResponseApi.handleResponse(response);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get suggestion products
  async getSuggestionProducts(keyword: string, page: number = 1, limit: number = 10): Promise<ApiResponse<ListResponse<ProductDetailResponse>>> {
    try {
      const response = await this.api.get(`/${prefix}/products/suggestion`, {
        params: {
          keyword,
          page,
          limit
        }
      });
      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

const authenticationApiService = new AuthenticationApiService();
export default authenticationApiService;
