// Auth utilities for token management

const TOKEN_KEY = 'api_token';
const USER_ID_KEY = 'user_id';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string, persistent = false): void {
  if (typeof window === 'undefined') return;
  const storage = persistent ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_ID_KEY) || sessionStorage.getItem(USER_ID_KEY);
}

export function setUserId(userId: string, persistent = false): void {
  if (typeof window === 'undefined') return;
  const storage = persistent ? localStorage : sessionStorage;
  storage.setItem(USER_ID_KEY, userId);
}

export function removeUserId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_ID_KEY);
  sessionStorage.removeItem(USER_ID_KEY);
}

export function clearAuth(): void {
  removeAuthToken();
  removeUserId();
}

