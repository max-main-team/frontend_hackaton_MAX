/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, useCallback } from "react";
import type { WebApp } from "../types/webapp";
import {
  setDeviceItem,
  getDeviceItem,
  removeDeviceItem,
} from "../services/webappStorage";
import { setAccessTokenInMemory } from "../services/api";

export type WebAppDataAny = any;

export function useMaxWebApp() {
  const [webApp, setWebApp] = useState<WebApp | null>(null);
  const [rawInitData, setRawInitData] = useState<WebAppDataAny | null>(null);
  const [webAppData, setWebAppData] = useState<WebAppDataAny | null>(null);

  useEffect(() => {
    if ((window as any).WebApp) {
      const w = (window as any).WebApp as WebApp;
      setWebApp(w);
      try {
        w.ready?.(() => {
          const data = w.initData;
          setRawInitData(data);
          setWebAppData(data);
        });
      } catch (e) {
        console.warn("WebApp ready error", e);
      }
    } else {
      console.warn("window.WebApp not available — running outside MAX client");
    }
  }, []);

  const saveAccessToken = useCallback(async (token: string) => {
    if (!token) return;
    await setDeviceItem("access_token", token);
    try { setAccessTokenInMemory(token); } catch (e) { console.warn("Error with set access_token in memory", e); }
  }, []);

  const loadAccessToken = useCallback(async (): Promise<string | null> => {
    return await getDeviceItem("access_token");
  }, []);

  const removeAccessToken = useCallback(async () => {
    try {
      await removeDeviceItem("access_token");
    } finally {
      try { setAccessTokenInMemory(null); } catch (e) { console.warn("Error with set access_token in memory", e); }
    }
  }, []);

  const clearAuthStorage = useCallback(async () => {
    await removeAccessToken();
  }, [removeAccessToken]);

  const helpers = useMemo(() => ({
    close: () => webApp?.close?.(),
    openLink: (url: string) => webApp?.openLink?.(url),
    raw: webApp,

    saveAccessToken,
    loadAccessToken,
    removeAccessToken,
    clearAuthStorage
  }), [
    webApp,
    saveAccessToken,
    loadAccessToken,
    removeAccessToken,
    clearAuthStorage
  ]);

  return {
    webApp,
    rawInitData,
    webAppData,
    ...helpers
  } as const;
}
