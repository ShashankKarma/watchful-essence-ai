import { apiClient, call } from "./apiClient";
import { db, save } from "@/lib/demoStore";
import { currentUserId } from "./session";
import { emergencyService } from "./emergencyService";
import type { SafetyAlert } from "@/lib/types";

export const alertService = {
  list(): Promise<SafetyAlert[]> {
    return call(
      () => apiClient.get("/api/alerts"),
      () =>
        db()
          .alerts.filter((a) => a.userId === currentUserId())
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  pending(): Promise<SafetyAlert | null> {
    return call(
      () => apiClient.get("/api/alerts"),
      () =>
        db().alerts.find((a) => a.userId === currentUserId() && a.response === "PENDING") ?? null,
    );
  },

  async respond(id: string, response: "SAFE" | "NEED_HELP" | "NO_RESPONSE") {
    const data = db();
    const alert = data.alerts.find((a) => a.id === id);
    if (!alert) return null;
    alert.response = response;
    alert.respondedAt = new Date().toISOString();
    alert.status = response === "SAFE" ? "RESOLVED" : "ESCALATED";
    save();

    if (response === "SAFE") return null;

    return emergencyService.trigger({
      triggerType: response === "NEED_HELP" ? "AI_DETECTION" : "AUTO_ESCALATION",
      riskLevel: alert.riskLevel,
      simulated: alert.simulated,
      detectionDetail: `Anomaly score ${alert.riskScore} — ${alert.riskLevel}`,
      responseDetail:
        response === "NEED_HELP"
          ? "User selected NEED HELP"
          : "No response within the alert timeout — automatic escalation",
    });
  },
};
