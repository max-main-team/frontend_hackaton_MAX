// src/services/api.ts
import axios from "axios";
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import {
  getDeviceItem,
  setDeviceItem,
  getSecureItem,
  setSecureItem,
  removeSecureItem
} from "../services/webappStorage"; 

const isDev = import.meta.env.DEV;
const envBase = import.meta.env.VITE_BACKEND_URL as string | undefined;
const baseURL = isDev ? "/api" : (envBase ?? "");

const rawAxios = axios.create({ baseURL });

export const api = axios.create({
  baseURL,
  timeout: 10000,
});


let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function doRefreshToken(): Promise<string> {
  const refresh = await getSecureItem("refresh_token");
  if (!refresh) throw new Error("No refresh token available");

  const res = await rawAxios.post("/auth/refresh", { refresh_token: refresh });
  const newAccess = res.data?.token;
  const newRefresh = res.data?.refresh_token;

  if (!newAccess) throw new Error("Refresh did not return access token");

  await setDeviceItem("access_token", newAccess);
  if (newRefresh) await setSecureItem("refresh_token", newRefresh);

  return newAccess;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) : Promise<InternalAxiosRequestConfig> => {
  try {
    const token = await getDeviceItem("access_token");
    if (token) {
      const safeHeaders = (config.headers ?? {}) as Record<string, string>;
      safeHeaders["Authorization"] = `Bearer ${token}`;
      config.headers = safeHeaders as unknown as InternalAxiosRequestConfig["headers"];
    }
  } catch (e) {
    console.warn("Failed to attach access token", e);
  }
  return config;
}, (error) => Promise.reject(error));


api.interceptors.response.use(
  (resp: AxiosResponse) => resp,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) return reject(error);
          original.headers = {
            ...(original.headers ?? {}),
            Authorization: `Bearer ${token}`
          } as InternalAxiosRequestConfig["headers"];
          resolve(api(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const newToken = await doRefreshToken();
      refreshQueue.forEach(cb => cb(newToken));
      refreshQueue = [];
      isRefreshing = false;

      original.headers = {
        ...(original.headers ?? {}),
        Authorization: `Bearer ${newToken}`
      } as InternalAxiosRequestConfig["headers"];
      return api(original);
    } catch (refreshErr) {
      try { await removeSecureItem("refresh_token"); } catch (e) { console.warn("Failed to remove secure token", e); }
      refreshQueue.forEach(cb => cb(null));
      refreshQueue = [];
      isRefreshing = false;
      return Promise.reject(refreshErr);
    }
  }
);

export default api;
