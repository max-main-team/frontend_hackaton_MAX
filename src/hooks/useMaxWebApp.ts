/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window { WebApp?: any }
}

export type InitData = Record<string,string>;

export function useMaxWebApp() {
  const [webApp, setWebApp] = useState<any | null>(null);
  const [initData, setInitData] = useState<InitData | null>(null);
  const isDev = import.meta.env.DEV && import.meta.env.VITE_WEBAPP_MOCK === "1";

  useEffect(() => {
    if (window.WebApp) {
      setWebApp(window.WebApp);
      try {
        window.WebApp.ready?.(() => {
          const data = window.WebApp.initData || window.WebApp.InitData || null;
          setInitData(parseInitDataString(data));
        });
      } catch (e) {
        console.warn("WebApp ready error", e);
      }
    } else if (isDev) {
      const mock = createMockWebApp();
      window.WebApp = mock;
      setWebApp(mock);
      setInitData(mock.initData);
    } else {
      console.warn("window.WebApp not available");
    }
  }, [isDev]);

  const helpers = useMemo(() => ({
    close: () => webApp?.close?.(),
    openLink: (url: string) => webApp?.openLink?.(url),
    raw: webApp
  }), [webApp]);

  return { webApp, initData, ...helpers };
}

function parseInitDataString(data: any): InitData | null {
  if (!data) return null;
  if (typeof data === "string") {
    const sp = new URLSearchParams(data);
    const out: Record<string,string> = {};
    for (const [k,v] of sp.entries()) out[k]=v;
    return out;
  }
  return data as InitData;
}

function createMockWebApp() {
  const initData = {
    user_id: "123456",
    first_name: "Dev",
    // hash пустой — это только для UI/dev
  };
  return {
    initData,
    InitData: initData,
    ready: (cb: any) => setTimeout(cb, 50),
    close: () => console.log("mock close"),
    openLink: (u: string) => { window.open(u, "_blank"); }
  };
}