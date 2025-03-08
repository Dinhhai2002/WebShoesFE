import handleResponseApi from "../handleResponseApi/handleResponseApi";
import BaseApiService from "./BaseApiService";

class UserApiService extends BaseApiService {
  private token: string | null;

  constructor(token?: any) {
    super(token);
    this.token = token || null;
  }

  public setToken(token: string | null) {
    this.token = token;
    this.updateAuthorizationHeader();
  }
  public async getUser(): Promise<any> {
    try {
      const response = await this.api.get(
        `/users/detail`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }



  public async update(
    fullName: any,
    email: any,
    phone: any,
    address: any
  ): Promise<any> {
    try {
      const response = await this.api.post(`/users/update`, {
        full_name: fullName,
        email: email,
        phone: phone,
        full_address: address,
      });

      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async changePassword(
    oldPassword: any,
    newPassword: any,
    confirmPassword: any
  ): Promise<any> {
    try {
      const response = await this.api.post(`/users/change-password`, {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      handleResponseApi.handleResponse(response);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async uploadAvatar(file: any): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await this.api.post(
        `/users/upload-avatar`,
        formData
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
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
const token = localStorage.getItem("token");

const userApiService = new UserApiService(token);
export default userApiService;
