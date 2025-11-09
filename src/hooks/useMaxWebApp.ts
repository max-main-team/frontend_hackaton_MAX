/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, useCallback } from "react";
import type { WebApp } from "../types/webapp";
import {
  setDeviceItem,
  getDeviceItem,
  removeDeviceItem,
  setSecureItem,
  getSecureItem,
  removeSecureItem
} from "../services/webappStorage";

export type WebAppDataAny = any;

export function useMaxWebApp() {
  const [webApp, setWebApp] = useState<WebApp | null>(null);
  const [rawInitData, setRawInitData] = useState<WebAppDataAny | null>(null);
  const [webAppData, setWebAppData] = useState<WebAppDataAny | null>(null);

  const isDev = import.meta.env.DEV && import.meta.env.VITE_WEBAPP_MOCK === "1";

  useEffect(() => {
    if (window.WebApp) {
      setWebApp(window.WebApp);
      try {
        window.WebApp.ready?.(() => {
          const data = window.WebApp?.initData;
          setRawInitData(data);
          setWebAppData(data);
        });
      } catch (e) {
        console.warn("WebApp ready error", e);
      }
    } else if (isDev) {
      const mock = createMockWebApp();
      window.WebApp = mock;
      setWebApp(mock);
      const data = mock.initData;
      setRawInitData(data);
      setWebAppData(data);
    } else {
      console.warn("window.WebApp not available");
    }
  }, [isDev]);


  const saveAccessToken = useCallback(async (token: string) => {
    if (!token) return;
    await setDeviceItem("access_token", token);
  }, []);

  const loadAccessToken = useCallback(async (): Promise<string | null> => {
    return await getDeviceItem("access_token");
  }, []);

  const removeAccessToken = useCallback(async () => {
    await removeDeviceItem("access_token");
  }, []);

  const saveRefreshToken = useCallback(async (token: string) => {
    if (!token) return;
    await setSecureItem("refresh_token", token);
  }, []);

  const loadRefreshToken = useCallback(async (): Promise<string | null> => {
    return await getSecureItem("refresh_token");
  }, []);

  const removeRefreshToken = useCallback(async () => {
    await removeSecureItem("refresh_token");
  }, []);

  const clearAuthStorage = useCallback(async () => {
    await removeRefreshToken();
    await removeAccessToken();
  }, [removeRefreshToken, removeAccessToken]);


  const helpers = useMemo(() => ({
    close: () => webApp?.close?.(),
    openLink: (url: string) => webApp?.openLink?.(url),
    raw: webApp,

    saveAccessToken,
    loadAccessToken,
    removeAccessToken,
    saveRefreshToken,
    loadRefreshToken,
    removeRefreshToken,
    clearAuthStorage
  }), [
    webApp,
    saveAccessToken,
    loadAccessToken,
    removeAccessToken,
    saveRefreshToken,
    loadRefreshToken,
    removeRefreshToken,
    clearAuthStorage
  ]);

  return {
    webApp,
    rawInitData,
    webAppData,
    ...helpers
  } as const;
}


function createMockWebApp() {
  return {
    initData: {
      query_id: "dev-query-1",
      auth_date: Math.floor(Date.now()/1000),
      hash: "",
      user: {
        id: 123456,
        first_name: "Dev",
        last_name: "Tester",
        username: "devtester",
        language_code: "ru"
      },
      chat: { id: 42, type: "private" },
      start_param: { foo: "bar" }
    },
    ready: (cb: any) => setTimeout(cb, 50),
    close: () => console.log("mock close"),
    openLink: (u: string) => { window.open(u, "_blank"); }
  };
}
