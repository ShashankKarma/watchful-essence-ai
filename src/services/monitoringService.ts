import { apiClient, call } from "./apiClient";
import { db, save, uid, DEMO_IDS } from "@/lib/demoStore";
import { currentUserId } from "./session";
import type { ActivityType, BehaviourData, MonitoringSession } from "@/lib/types";

export interface BehaviourDataRequest {
  activityType: ActivityType;
  latitude: number;
  longitude: number;
  movementDuration: number;
  activityDuration: number;
  timestamp?: string;
  simulated?: boolean;
}

export const monitoringService = {
  status(): Promise<MonitoringSession | null> {
    return call(
      () => apiClient.get("/api/monitoring/status"),
      () => db().sessions.find((s) => s.userId === currentUserId() && s.active) ?? null,
    );
  },

  start(): Promise<MonitoringSession> {
    return call(
      () => apiClient.post("/api/monitoring/start"),
      () => {
        const data = db();
        const userId = currentUserId();
        const existing = data.sessions.find((s) => s.userId === userId && s.active);
        if (existing) return existing;
        const session: MonitoringSession = {
          id: uid(),
          userId,
          startedAt: new Date().toISOString(),
          active: true,
          behaviourCount: 0,
        };
        data.sessions.push(session);
        const user = data.users.find((u) => u.id === userId);
        if (user) user.monitoringEnabled = true;
        save();
        return session;
      },
    );
  },

  stop(): Promise<{ success: boolean }> {
    return call(
      () => apiClient.post("/api/monitoring/stop"),
      () => {
        const data = db();
        const userId = currentUserId();
        data.sessions
          .filter((s) => s.userId === userId && s.active)
          .forEach((s) => {
            s.active = false;
            s.endedAt = new Date().toISOString();
          });
        const user = data.users.find((u) => u.id === userId);
        if (user) user.monitoringEnabled = false;
        save();
        return { success: true };
      },
    );
  },

  history(): Promise<BehaviourData[]> {
    return call(
      () => apiClient.get("/api/behaviour"),
      () =>
        db()
          .behaviour.filter((b) => b.userId === currentUserId())
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
          .slice(0, 60),
    );
  },

  record(payload: BehaviourDataRequest): Promise<BehaviourData> {
    return call(
      () => apiClient.post("/api/behaviour", payload),
      () => {
        const data = db();
        const entry: BehaviourData = {
          id: uid(),
          userId: currentUserId(),
          activityType: payload.activityType,
          timestamp: payload.timestamp ?? new Date().toISOString(),
          latitude: payload.latitude,
          longitude: payload.longitude,
          movementDuration: payload.movementDuration,
          activityDuration: payload.activityDuration,
          simulated: payload.simulated ?? false,
        };
        data.behaviour.push(entry);
        const session = data.sessions.find((s) => s.userId === entry.userId && s.active);
        if (session) session.behaviourCount += 1;
        save();
        return entry;
      },
    );
  },

  /** Builds a behaviour sample that matches the user's normal pattern. */
  normalSample(simulated = false): BehaviourDataRequest {
    const now = new Date();
    now.setHours(Math.min(20, Math.max(9, now.getHours())));
    return {
      activityType: "WALKING",
      latitude: DEMO_IDS.BASE.lat + 0.002,
      longitude: DEMO_IDS.BASE.lng + 0.001,
      movementDuration: 23,
      activityDuration: 30,
      timestamp: now.toISOString(),
      simulated,
    };
  },

  /** Builds a behaviour sample that deviates strongly from the baseline. */
  anomalousSample(simulated = true): BehaviourDataRequest {
    const night = new Date();
    night.setHours(2, 40, 0, 0);
    return {
      activityType: "RUNNING",
      latitude: DEMO_IDS.BASE.lat + 0.085,
      longitude: DEMO_IDS.BASE.lng - 0.072,
      movementDuration: 92,
      activityDuration: 12,
      timestamp: night.toISOString(),
      simulated,
    };
  },
};
