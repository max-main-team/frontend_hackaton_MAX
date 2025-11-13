export async function setDeviceItem(key: string, value: string): Promise<void> {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("[webappStorage] setItem failed", e);
  }
}

export async function getDeviceItem(key: string): Promise<string | null> {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn("[webappStorage] getItem failed", e);
    return null;
  }
}

export async function removeDeviceItem(key: string): Promise<void> {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("[webappStorage] removeItem failed", e);
  }
}