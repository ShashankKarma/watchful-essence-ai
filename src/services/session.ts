import { db } from "@/lib/demoStore";
import { getToken } from "./apiClient";

/** Resolves the acting user id for local demo-mode operations. */
export function currentUserId(): string {
  const data = db();
  return data.session?.userId ?? getToken()?.replace("local.", "") ?? "u-demo";
}
