/* eslint-disable @typescript-eslint/no-explicit-any */

export type WebAppLike = {
  DeviceStorage?: {
    setItem?: (k: string, v: string) => Promise<void> | void;
    getItem?: (k: string) => Promise<string | null> | string | null;
    removeItem?: (k: string) => Promise<void> | void;
    clear?: () => Promise<void> | void;
  };
  ready?: (cb: () => void) => void;
  [k: string]: any;
};

let cachedWebApp: WebAppLike | null | undefined = undefined;

export function getCachedWebApp(): WebAppLike | null {
  if (cachedWebApp !== undefined) return cachedWebApp;
  if (typeof window === "undefined") {
    cachedWebApp = null;
    return cachedWebApp;
  }
  cachedWebApp = window.WebApp ?? null;
  return cachedWebApp;
}

export function setCachedWebApp(w: WebAppLike | null): void {
  cachedWebApp = w;
}

export function onWebAppReady(cb: () => void): void {
  const w = getCachedWebApp();
  if (w && typeof w.ready === "function") {
    try {
      w.ready(cb);
      return;
    } catch (e) {
      console.warn("webappClient.onWebAppReady: ready threw", e);
      try { cb(); } catch { /* empty */ }
      return;
    }
  }

  let attempts = 0;
  const maxAttempts = 10;
  const interval = setInterval(() => {
    attempts += 1;
    const maybe = (window as any).WebApp ?? null;
    if (maybe) {
      setCachedWebApp(maybe);
      try {
        if (typeof maybe.ready === "function") {
          maybe.ready(cb);
        } else {
          cb();
        }
      } catch (e) {
        console.warn("webappClient.onWebAppReady: error calling ready/cb", e);
        try { cb(); } catch { /* empty */ }
      }
      clearInterval(interval);
      return;
    }
    if (attempts >= maxAttempts) {
      clearInterval(interval);
      try { cb(); } catch { /* empty */ }
    }
  }, 100);
}
