/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCachedWebApp } from "./webappClient";

async function tryCallMaybePromise<T>(fnResult: any): Promise<T | undefined> {
  return await Promise.resolve(fnResult);
}

export async function setDeviceItem(key: string, value: string): Promise<void> {
  try {
    const w = getCachedWebApp() ?? ((typeof window !== "undefined") ? (window as any).WebApp : null);
    if (w?.DeviceStorage && typeof w.DeviceStorage.setItem === "function") {
      await tryCallMaybePromise(w.DeviceStorage.setItem(key, value));
      return;
    }
    //localStorage.setItem(key, value);
  } catch (e) {
    console.warn("[webappStorage] setItem failed, fallback/localStorage attempted", e);
    try { localStorage.setItem(key, value); } catch (e2) { console.warn("[webappStorage] localStorage.setItem also failed", e2); }
  }
}

export async function getDeviceItem(key: string): Promise<string | null> {
  try {
    const w = getCachedWebApp() ?? ((typeof window !== "undefined") ? (window as any).WebApp : null);
    if (w?.DeviceStorage && typeof w.DeviceStorage.getItem === "function") {
      const v = await tryCallMaybePromise<string | null>(w.DeviceStorage.getItem(key));
      return v ?? null;
    }
    //const v = localStorage.getItem(key);
    return null;
  } catch (e) {
    console.warn("[webappStorage] getItem failed, falling back to localStorage", e);
    try { return localStorage.getItem(key); } catch (e2) { console.warn("[webappStorage] localStorage.getItem failed", e2); return null; }
  }
}

export async function removeDeviceItem(key: string): Promise<void> {
  try {
    const w = getCachedWebApp() ?? ((typeof window !== "undefined") ? (window as any).WebApp : null);
    if (w?.DeviceStorage && typeof w.DeviceStorage.removeItem === "function") {
      await tryCallMaybePromise(w.DeviceStorage.removeItem(key));
      return;
    }
    //localStorage.removeItem(key);
  } catch (e) {
    console.warn("[webappStorage] removeItem failed; attempted localStorage", e);
    try { localStorage.removeItem(key); } catch (e2) { console.warn("[webappStorage] localStorage.removeItem failed", e2); }
  }
}
