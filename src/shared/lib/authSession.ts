import type { AuthUser } from "@/shared/types/auth";

const STORAGE_KEY = "lovold:auth";
export const AUTH_SESSION_EVENT = "auth-session-changed";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const emitChange = () => {
  if (!canUseStorage()) return;
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
};

export const getAuthSession = (): AuthUser | null => {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch (error) {
    console.error("Failed to parse auth session", error);
    return null;
  }
};

export const saveAuthSession = (user: AuthUser) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  emitChange();
};

export const clearAuthSession = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  emitChange();
};

export const isAuthenticated = () => Boolean(getAuthSession());
