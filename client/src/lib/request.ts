import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearAuthSession, getAuthToken } from "./auth-storage";

type ErrorResponseData = {
  message?: string;
};

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api",
  // 线上后端使用免费实例时可能会有冷启动，适当拉长超时时间避免首次请求过早失败。
  timeout: 30000,
});

// 统一给请求附加默认请求头和登录 token。
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

// 统一处理后端错误信息，并在登录失效时清理本地会话。
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
    const normalizedError = new Error(serverMessage || fallbackMessage);

    return Promise.reject(normalizedError);
  }
);

export { request };
