/* eslint-disable @typescript-eslint/no-explicit-any */
export interface WebAppUser {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  [k: string]: any;
}

export interface WebAppChat {
  id?: number | string;
  type?: string;
  [k: string]: any;
}

export interface WebAppStartParam { [k: string]: any; }

export interface WebAppData {
  query_id?: string;
  auth_date?: number;
  hash?: string;
  start_param?: WebAppStartParam | string;
  user?: WebAppUser;
  chat?: WebAppChat;
  [k: string]: any;
}

export interface DeviceStorageAPI {
  setItem(key: string, value: string): Promise<void> | void;
  getItem(key: string): Promise<string | null> | string | null;
  removeItem(key: string): Promise<void> | void;
  clear?(): Promise<void> | void;
}

export interface SecureStorageAPI {
  setItem(key: string, value: string): Promise<void> | void;
  getItem(key: string): Promise<string | null> | string | null;
  removeItem(key: string): Promise<void> | void;
}

export interface BackButtonAPI {
  setVisible(visible: boolean): void;
  setHandler(cb: () => void): void;
  removeHandler(): void;
}

export interface ScreenCaptureAPI {
  enable(): void;
  disable(): void;
  isEnabled?: () => boolean;
}

export interface HapticFeedbackAPI {
  light?: () => void;
  medium?: () => void;
  heavy?: () => void;
}

export interface WebApp {
  initData?: string | WebAppData;
  initDataUnsafe?: WebAppData;
  platform?: "ios" | "android" | "desktop" | "web";
  version?: string;

  onEvent?: (eventName: string, cb: (...args: any[]) => void) => void;
  offEvent?: (eventName: string, cb: (...args: any[]) => void) => void;
  ready?: (cb: () => void) => void;
  close?: () => void;
  enableClosingConfirmation?: () => void;
  disableClosingConfirmation?: () => void;

  requestContact?: () => Promise<any> | void;
  openLink?: (url: string) => void;
  openMaxLink?: (url: string) => void;
  shareContent?: (text: string, link?: string) => void;
  shareMaxContent?: (text: string, link?: string) => void;
  downloadFile?: (url: string, fileName?: string) => void;
  openCodeReader?: (fileSelect?: boolean) => Promise<string | null> | void;

  BackButton?: BackButtonAPI;
  ScreenCapture?: ScreenCaptureAPI;
  HapticFeedback?: HapticFeedbackAPI;

  DeviceStorage?: DeviceStorageAPI;
  SecureStorage?: SecureStorageAPI;

  [k: string]: any;
}

declare global {
  interface Window {
    WebApp?: WebApp;
  }
}
