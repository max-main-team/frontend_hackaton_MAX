export async function setDeviceItem(key: string, value: string) {
  if (typeof window === "undefined" || !window.WebApp?.DeviceStorage?.setItem) {
    localStorage.setItem(key, value); // fallback для dev
    return;
  }
  await window.WebApp.DeviceStorage.setItem(key, value);
}

export async function getDeviceItem(key: string): Promise<string | null> {
  if (typeof window === "undefined" || !window.WebApp?.DeviceStorage?.getItem) {
    return localStorage.getItem(key);
  }
  return await window.WebApp.DeviceStorage.getItem(key);
}

export async function removeDeviceItem(key: string) {
  if (typeof window === "undefined" || !window.WebApp?.DeviceStorage?.removeItem) {
    localStorage.removeItem(key);
    return;
  }
  await window.WebApp.DeviceStorage.removeItem(key);
}

export async function setSecureItem(key: string, value: string) {
  if (typeof window === "undefined" || !window.WebApp?.SecureStorage?.setItem) {
    localStorage.setItem(key, value);
    return;
  }
  await window.WebApp.SecureStorage.setItem(key, value);
}

export async function getSecureItem(key: string): Promise<string | null> {
  if (typeof window === "undefined" || !window.WebApp?.SecureStorage?.getItem) {
    return localStorage.getItem(key);
  }
  return await window.WebApp.SecureStorage.getItem(key);
}

export async function removeSecureItem(key: string) {
  if (typeof window === "undefined" || !window.WebApp?.SecureStorage?.removeItem) {
    localStorage.removeItem(key);
    return;
  }
  await window.WebApp.SecureStorage.removeItem(key);
}

export async function initBiometrics() {
  if (!window.WebApp?.BiometricManager) return null;
  if (!window.WebApp.BiometricManager.isInited) {
    await window.WebApp.BiometricManager.init();
  }
  return window.WebApp.BiometricManager;
}
