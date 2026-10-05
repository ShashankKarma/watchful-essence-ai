import axios from "axios";

export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "";

/** True when a Spring Boot backend URL is configured. */
export const hasRemote = Boolean(API_BASE_URL);

const TOKEN_KEY = "guardianai.token";

// A real backend is configured: drop any leftover demo-mode token so only
// genuine JWTs issued by the Spring Boot server are ever sent.
if (hasRemote && typeof window !== "undefined") {
  const stored = window.localStorage.getItem(TOKEN_KEY);
  if (stored?.startsWith("local.")) window.localStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL || "/api-unconfigured",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      setToken(null);
    }
    return Promise.reject(error);
  },
);

/**
 * Calls the Spring Boot API when configured, otherwise runs the local
 * demo implementation so the app stays fully usable offline.
 */
export async function call<T>(
  request: () => Promise<{ data: unknown }>,
  local: () => T | Promise<T>,
): Promise<T> {
  if (!hasRemote) return local();
  try {
    const res = await request();
    const body = res.data as { data?: T } | T;
    if (body && typeof body === "object" && "data" in (body as Record<string, unknown>)) {
      return (body as { data: T }).data;
    }
    return body as T;
  } catch (error) {
    console.warn("[GuardianAI] API call failed, using local demo data.", error);
    return local();
  }
}
