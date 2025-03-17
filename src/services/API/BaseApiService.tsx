import axios, { AxiosError, AxiosInstance, HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { routes } from "../../routes/routes";

class BaseApiService {
  protected api: AxiosInstance;

  constructor(token?: string) {
    const headers: { [key: string]: string } = {
      "Accept-Encoding": "application/json",
      // Add other headers if required
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    this.api = axios.create({
      baseURL: `${process.env.REACT_APP_BASE_URL}`,
      headers,
    });

    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === HttpStatusCode.Unauthorized) {
          // Clear token from localStorage
          localStorage.removeItem("token");
          
          // Show error message
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
          
          // Redirect to login page after 2 seconds
          setTimeout(() => {
            window.location.href = routes.Login;
          }, 2000);
        }
        return Promise.reject(error);
      }
    );
  }
}

export default BaseApiService;
