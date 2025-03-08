import handleResponseApi from "../handleResponseApi/handleResponseApi";
import BaseApiService from "./BaseApiService";

const prefix = "authentication";

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
}

const authenticationApiService = new AuthenticationApiService();
export default authenticationApiService;
