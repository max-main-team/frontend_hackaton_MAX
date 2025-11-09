import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const baseURL = import.meta.env.DEV ? "/api" : (import.meta.env.VITE_BACKEND_URL as string || "");

export const api = axios.create({ baseURL });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("access_token");

  const safeHeaders = (config.headers ?? {}) as Record<string, string>;

  if (token) {
    safeHeaders["Authorization"] = `Bearer ${token}`;
  }

  config.headers = safeHeaders as InternalAxiosRequestConfig["headers"];

  return config;
}, (error) => {
  return Promise.reject(error);
});
