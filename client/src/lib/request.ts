import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearAuthSession, getAuthToken } from "./auth-storage";

type ErrorResponseData = {
  message?: string;
};

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api",
  timeout: 30000,
});

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers.set("Accept", "application/json");

    if (!config.headers.has("Content-Type") && config.method !== "get") {
      config.headers.set("Content-Type", "application/json");
    }

    const token = getAuthToken();

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

request.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponseData>) => {
    if (error.response?.status === 401) {
      clearAuthSession();
    }

    const serverMessage = error.response?.data?.message;
    const fallbackMessage =
      error.code === "ECONNABORTED"
        ? "请求超时，服务器可能正在唤醒，请稍后重试"
        : "请求失败，请稍后重试";

    return Promise.reject(new Error(serverMessage || fallbackMessage));
  }
);

export { request };
