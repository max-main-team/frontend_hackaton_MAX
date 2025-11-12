/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, useCallback } from "react";
import type { WebApp } from "../types/webapp";
import {
  setDeviceItem,
  getDeviceItem,
  removeDeviceItem,
} from "../services/webappStorage";
import { setAccessTokenInMemory } from "../services/api";
import { setCachedWebApp, onWebAppReady, getCachedWebApp } from "../services/webappClient";

export type WebAppDataAny = any;

export function useMaxWebApp() {
  const [webApp, setWebApp] = useState<WebApp | null>(null);
  const [rawInitData, setRawInitData] = useState<WebAppDataAny | null>(null);
  const [webAppData, setWebAppData] = useState<WebAppDataAny | null>(null);

  const readInitFrom = (w: any) => w?.initData;

  useEffect(() => {
    const maybeWebApp = (window as any).WebApp ?? null;
    if (!maybeWebApp) {
      console.warn("[useMaxWebApp] window.WebApp not available — running outside MAX client");
      // We still call onWebAppReady to detect it if it appears later
      onWebAppReady(() => {
        const w = getCachedWebApp();
        if (w) {
          setWebApp(w as any);
          // set raw initData as before
          const sync = readInitFrom(w);
          if (sync) {
            setRawInitData(sync);
            setWebAppData(sync);
          }
        }
      });
      return;
    }

    // cache it once for everyone
    setCachedWebApp(maybeWebApp);
    setWebApp(maybeWebApp);

    try {
      const sync = readInitFrom(maybeWebApp);
      if (sync) {
        setRawInitData(sync);
        setWebAppData(sync);
      }
    } catch (e) { console.warn("[useMaxWebApp] error reading initData synchronously", e); }

    if (typeof maybeWebApp.ready === "function") {
      try {
        maybeWebApp.ready(() => {
          try {
            const d = readInitFrom(maybeWebApp);
            setRawInitData(d);
            setWebAppData(d);
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

    try { setAccessTokenInMemory(token); } catch (e) { console.warn("setAccessTokenInMemory failed", e); }

    setDeviceItem("access_token", token).catch(e => {
      console.warn("saveAccessToken: persist failed", e);
    });
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
