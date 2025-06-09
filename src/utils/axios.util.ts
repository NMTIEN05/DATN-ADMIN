import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
// import { NEXT_PUBLIC_API_URL, NEXT_PUBLIC_AUTH_API_URL } from "./env";
// import { clearUserInfoAndToken, getCommonStateFromLocalStorage } from "./utils";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  isAuthApi?: boolean;
}

const axiosInstance = axios.create({
  baseURL: process.env.PUBLIC_API_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // log error ra để kiểm tra rồi sử lý

    return Promise.reject(error);
  }
);

axiosInstance.interceptors.request.use(
  (config) => {
    // const token = getCommonStateFromLocalStorage()?.token;
    // if (token && config.headers) {
    //   config.headers.set(
    //     "Authorization",
    //     (config as CustomAxiosRequestConfig).isAuthApi
    //       ? `Bearer ${token}`
    //       : token
    //   );
    // }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
