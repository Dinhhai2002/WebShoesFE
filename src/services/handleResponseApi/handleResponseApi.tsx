class HandleResponseApi {
  public handleResponse(response: any): string {
    if (response.data.status === 400) {
      throw new Error(response.data.message);
    } else if (response.data.status === 401) {
      throw new Error("Bạn không có quyền truy cập api này!");
    }

    return "";
  }
}

const handleResponseApi = new HandleResponseApi();
export default handleResponseApi;
