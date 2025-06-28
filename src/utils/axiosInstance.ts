import axios from "axios";

// Lấy token từ localStorage hoặc nơi lưu token của bạn
const token = localStorage.getItem("token");

const axiosInstance = axios.create({
  baseURL: "http://localhost:8888/api", // đổi theo backend của bạn
  timeout: 10000, // timeout 10s (tuỳ chọn)
});

// Thêm interceptor để tự động thêm Authorization header nếu có token
axiosInstance.interceptors.request.use(
  (config) => {
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Bạn cũng có thể thêm interceptor response để xử lý lỗi chung
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi chung, ví dụ token hết hạn => redirect login
    if (error.response?.status === 401) {
      // Xử lý logout hoặc redirect
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
