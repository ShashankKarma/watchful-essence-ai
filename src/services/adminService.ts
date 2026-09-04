import { apiClient, call } from "./apiClient";
import { db } from "@/lib/demoStore";
import type { AdminDashboard, EmergencyEvent, User } from "@/lib/types";

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export const adminService = {
  dashboard(): Promise<AdminDashboard> {
    return call(
      () => apiClient.get("/api/admin/dashboard"),
      () => {
        const data = db();
        const today = new Date().toISOString().slice(0, 10);
        const levels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
        const days = Array.from({ length: 7 }).map((_, i) =>
          new Date(Date.now() - (6 - i) * 86400_000).toISOString().slice(0, 10),
        );

        return {
          totalUsers: data.users.length,
          activeMonitoringSessions: data.sessions.filter((s) => s.active).length,
          alertsToday: data.alerts.filter((a) => dayKey(a.createdAt) === today).length,
          highRiskEvents: data.risks.filter((r) => r.anomalyScore > 60).length,
          emergencyEvents: data.emergencies.length,
          riskDistribution: levels.map((level) => ({
            level,
            count: data.risks.filter((r) => r.riskLevel === level).length,
          })),
          alertsOverTime: days.map((date) => ({
            date: date.slice(5),
            alerts: data.alerts.filter((a) => dayKey(a.createdAt) === date).length,
            emergencies: data.emergencies.filter((e) => dayKey(e.timestamp) === date).length,
          })),
          monitoringActivity: days.map((date) => ({
            date: date.slice(5),
            sessions: data.sessions.filter((s) => dayKey(s.startedAt) === date).length,
          })),
        } satisfies AdminDashboard;
      },
    );
  },

  users(): Promise<User[]> {
    return call(
      () => apiClient.get("/api/admin/users"),
      () => db().users.map(({ password: _p, ...u }) => u as User),
    );
  },

  emergencies(): Promise<EmergencyEvent[]> {
    return call(
      () => apiClient.get("/api/admin/emergencies"),
      () => [...db().emergencies].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    );
  },
};
