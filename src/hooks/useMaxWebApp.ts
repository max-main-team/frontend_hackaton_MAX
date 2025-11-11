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

  const readInitFrom = (w: any) => w?.initData;

  useEffect(() => {
    const maybeWebApp = (window as any).WebApp as WebApp | undefined;

    if (!maybeWebApp) {
      console.warn("[useMaxWebApp] window.WebApp not available — running outside MAX client");
      return;
    }

    const w = maybeWebApp;
    setWebApp(w);

    try {
      const sync = readInitFrom(w);
      if (sync) {
        setRawInitData(sync);
        setWebAppData(sync);
        console.debug("[useMaxWebApp] used synchronous initData", sync);
      }
    } catch (e) {
      console.warn("[useMaxWebApp] error reading initData synchronously", e);
    }

    if (typeof w.ready === "function") {
      try {
        w.ready(() => {
          try {
            const d = readInitFrom(w);
            setRawInitData(d);
            setWebAppData(d);
            console.debug("[useMaxWebApp] ready callback set initData", d);
          } catch (inner) {
            console.warn("[useMaxWebApp] error in ready callback", inner);
          }
        });
      } catch (e) {
        console.warn("[useMaxWebApp] WebApp.ready threw", e);
      }
    }
  }, []);

  const saveAccessToken = useCallback(async (token: string) => {
    if (!token) return;
    await setDeviceItem("access_token", token);
    try { setAccessTokenInMemory(token); } catch (e) { console.warn("setAccessTokenInMemory error", e); }
  }, []);

  const loadAccessToken = useCallback(async (): Promise<string | null> => {
    try { return await getDeviceItem("access_token"); } catch { return null; }
  }, []);

  const removeAccessToken = useCallback(async () => {
    try {
      await removeDeviceItem("access_token");
    } finally {
      try { setAccessTokenInMemory(null); } catch (e) { console.warn("setAccessTokenInMemory error", e); }
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
  }), [webApp, saveAccessToken, loadAccessToken, removeAccessToken, clearAuthStorage]);

  return {
    webApp,
    rawInitData,
    webAppData,
    ...helpers
  } as const;
}
