import axios from "axios";
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import {
  getDeviceItem,
  setDeviceItem,
  removeDeviceItem
} from "./webappStorage";

const BACKEND = (import.meta.env.VITE_BACKEND_URL as string) ?? "";

export const api = axios.create({
  baseURL: BACKEND || undefined,
  timeout: 10000,
  withCredentials: true,
});

let memoryAccessToken: string | null = null;
export function setAccessTokenInMemory(token: string | null) {
  memoryAccessToken = token;
}

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];


async function doRefreshToken(): Promise<string> {
  const refreshUrl = (BACKEND ? `${BACKEND.replace(/\/$/, "")}/auth/refresh` : "/auth/refresh");
  const res = await axios.post(refreshUrl, undefined, { withCredentials: true });
  const newAccess = res.data?.access_token;

  if (!newAccess) {
    throw new Error("Refresh did not return access token");
  }

  await setDeviceItem("access_token", newAccess);
  memoryAccessToken = newAccess;

  return newAccess;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) : Promise<InternalAxiosRequestConfig> => {
  try {
    let token = memoryAccessToken;
    if (!token) {
      token = await getDeviceItem("access_token");
      memoryAccessToken = token ?? null;
    }
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
    if (!error || !error.config) return Promise.reject(error);

    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    const url = (original.url || "").toString();

    if (url.includes("/auth/refresh")) {
      try {
        await removeDeviceItem("access_token");
      } catch (e) { console.warn("Failed to remove access_token", e); }
      memoryAccessToken = null;
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
      try { await removeDeviceItem("access_token"); } catch (e) { console.warn("Failed to cleanup tokens", e); }
      memoryAccessToken = null;
      refreshQueue.forEach(cb => cb(null));
      refreshQueue = [];
      isRefreshing = false;
      return Promise.reject(refreshErr);
    }
  }
);

export default api;
