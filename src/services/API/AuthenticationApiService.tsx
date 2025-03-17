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

const prefix = "authentication";

interface ListResponse<T> {
    limit: number;
    list: T[];
    total_record: number;
}

interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
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
      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      // throw new Error(error.message);
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
      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      // throw new Error(error.message);
    }
  }

  public async Register(
    user_name: any,
    full_name: any,
    email: any,
    gender: any,
    phone: any,
    password: any,
    birthday: any,
    city_id: any,
    district_id: any,
    ward_id: any,
    full_address: any
  ): Promise<any> {
    try {
      const response: any = await this.api.post(
        `/authentication/register`,
        {
          user_name,
          full_name,
          email,
          gender,
          phone,
          password,
          birthday,
          city_id,
          district_id,
          ward_id,
          full_address,
        }
      );

      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async OtpRegister(
    user_name: any,
    full_name: any,
    email: any,
    phone: any,
    password: any,
    gender: number,
    birthday: any,
    ward_id: number,
    district_id: number,
    city_id: number,
    full_address: any
  ): Promise<any> {
    try {
      const response: any = await this.api.post(
        `/authentication/otp-register`,
        {
          user_name,
          full_name,
          email,
          phone,
          password,
          gender,
          birthday,
          ward_id,
          district_id,
          city_id,
          full_address,
        }
      );

      handleResponseApi.handleResponse(response);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
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

      handleResponseApi.handleResponse(response);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async confirmOtp(
    user_name: any,
    email: any,
    otp: number,
    type: number
  ): Promise<any> {
    try {
      const response: any = await this.api.post(`/${prefix}/confirm-otp`, {
        user_name,
        email,
        otp,
        type,
      });

      handleResponseApi.handleResponse(response);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
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

      handleResponseApi.handleResponse(response);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async getAllCity(): Promise<any> {
    try {
      const response: any = await this.api.get(
        `/authentication/get-all-city`
      );

      handleResponseApi.handleResponse(response);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async findDistrictByCityId(id: number): Promise<any> {
    try {
      const response: any = await this.api.get(
        `/${prefix}/${id}/get-district-by-city`
      );

      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async findWardByDistrictId(id: number): Promise<any> {
    try {
      const response: any = await this.api.get(
        `/${prefix}/${id}/get-ward-by-district`
      );

      handleResponseApi.handleResponse(response);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
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
}

const authenticationApiService = new AuthenticationApiService();
export default authenticationApiService;
