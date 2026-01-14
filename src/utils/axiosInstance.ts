import axios from "axios";

// Tạo một instance của axios
const axiosInstance = axios.create({
  baseURL: "http://localhost:8888/api", // Thay bằng API backend của bạn nếu cần
  timeout: 100000,
});

// Interceptor để gắn token vào request header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // ✅ Lấy token mỗi lần gửi request
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý lỗi response
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ✅ Token hết hạn hoặc không hợp lệ => logout + redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
