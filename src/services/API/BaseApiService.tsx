import axios, { AxiosError, AxiosInstance, HttpStatusCode } from "axios";
import { toast } from "react-toastify";

class BaseApiService {
  protected api: AxiosInstance;

  constructor(token?: string) {
    const headers: { [key: string]: string } = {
      // "Accept-Encoding": "application/json",
      // "Authorization": `Bearer ${token}`,
      // Add other headers if required
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    this.api = axios.create({
      baseURL: `${process.env.REACT_APP_BASE_URL}`,
      headers,
    });
    // this.api.interceptors.response.use(
    //   (response) => {
    //     const { url } = response.config;

    //     if (url === routes.Login) {
    //     }

    //     if (response.data.status === HttpStatusCode.BadRequest) {
    //       if (response.data.message === "Dữ liệu không hợp lệ") {
    //         toast.error(response.data.data[0]);
    //       } else if (response.data.message === "Mục tiêu không tìm thấy!") {
    //         return response;
    //       } else {
    //         toast.error(response.data.message);
    //       }
    //     }
    //     return response;
    //   },
    //   (error: AxiosError) => {
    //     if (error.response?.status === HttpStatusCode.Unauthorized) {
    //       localStorage.removeItem("token");
    //       toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
    //       setTimeout(() => {
    //         window.location.href = routes.Login;
    //       }, 3000);
    //     } else if (error.response?.status === HttpStatusCode.Forbidden) {
    //       toast.error("Bạn không có quyền truy cập vào API này!");
    //     } else {
    //       const data: any | undefined = error.response?.data;
    //       const message = data.message || error.message;
    //       toast.error(message);
    //     }
    //   }
    // );
  }
}

export default BaseApiService;
