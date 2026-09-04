import { apiClient, call } from "./apiClient";
import { db } from "@/lib/demoStore";
import type { SafetyTip } from "@/lib/types";

export const safetyTipService = {
  list(): Promise<SafetyTip[]> {
    return call(
      () => apiClient.get("/api/safety-tips"),
      () => db().tips,
    );
  },
};
