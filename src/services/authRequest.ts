import axios from "axios";
import { apiClient } from "./apiClient";

/**
 * POST to an auth endpoint on the live backend. Tolerates Render free-tier
 * cold starts (long first response / transient 502-504) by using a longer
 * timeout and retrying once, and turns axios errors into readable messages.
 */
export async function authPost<T>(path: string, payload: unknown): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await apiClient.post(path, payload, { timeout: 60000 });
      const body = res.data as { data?: T } | T;
      return ((body as { data?: T }).data ?? (body as T)) as T;
    } catch (error) {
      lastError = error;
      if (!axios.isAxiosError(error)) break;
      const status = error.response?.status;
      const transient = !error.response || status === 502 || status === 503 || status === 504;
      if (!transient) break;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error(describe(lastError));
}

function describe(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (error.response?.status === 401) return "Invalid email or password";
    if (!error.response) {
      return "Cannot reach the GuardianAI server. It may be waking up — please try again in a moment.";
    }
    return `Server error (${error.response.status})`;
  }
  return error instanceof Error ? error.message : "Request failed";
}
