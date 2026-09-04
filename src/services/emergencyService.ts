import { apiClient, call } from "./apiClient";
import { db, save, uid } from "@/lib/demoStore";
import { currentUserId } from "./session";
import type { EmergencyEvent, RiskLevel, TriggerType } from "@/lib/types";

export interface TriggerEmergencyInput {
  triggerType: TriggerType;
  riskLevel: RiskLevel;
  simulated?: boolean;
  detectionDetail?: string;
  responseDetail?: string;
}

function localTrigger(input: TriggerEmergencyInput): EmergencyEvent {
  const data = db();
  const userId = currentUserId();
  const at = () => new Date().toISOString();
  const lastLocation = data.locations
    .filter((l) => l.userId === userId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
  const contacts = data.contacts.filter((c) => c.userId === userId && c.notificationEnabled);

  const event: EmergencyEvent = {
    id: uid(),
    userId,
    triggerType: input.triggerType,
    riskLevel: input.riskLevel,
    locationId: lastLocation?.id,
    latitude: lastLocation?.latitude,
    longitude: lastLocation?.longitude,
    status: input.triggerType === "AUTO_ESCALATION" ? "AUTO_ESCALATED" : "ACTIVE",
    notifiedContactIds: contacts.map((c) => c.id),
    simulated: input.simulated ?? false,
    timestamp: at(),
    timeline: [
      {
        stage: "Detection",
        detail: input.detectionDetail ?? `${input.triggerType.replace(/_/g, " ")} — ${input.riskLevel} risk`,
        at: at(),
      },
      { stage: "User Response", detail: input.responseDetail ?? "Emergency confirmed", at: at() },
      {
        stage: "Capture Location",
        detail: lastLocation
          ? `Last known position ${lastLocation.latitude.toFixed(5)}, ${lastLocation.longitude.toFixed(5)}`
          : "No recent location available",
        at: at(),
      },
      {
        stage: "Contact Notification",
        detail: `${contacts.length} trusted contact(s) notified in-app (SMS/calls are simulated)`,
        at: at(),
      },
      { stage: "Emergency Event", detail: "Emergency event created and active", at: at() },
    ],
  };
  data.emergencies.unshift(event);

  data.notifications.unshift({
    id: uid(),
    userId,
    emergencyEventId: event.id,
    type: "EMERGENCY",
    title: `${event.simulated ? "[DEMO] " : ""}Emergency workflow started`,
    message: `Trigger: ${event.triggerType.replace(/_/g, " ")}. ${contacts.length} trusted contact(s) notified (simulated).`,
    status: "UNREAD",
    createdAt: at(),
  });
  save();
  return event;
}

export const emergencyService = {
  trigger(input: TriggerEmergencyInput): Promise<EmergencyEvent> {
    return call(
      () => apiClient.post("/api/sos", input),
      () => localTrigger(input),
    );
  },

  history(): Promise<EmergencyEvent[]> {
    return call(
      () => apiClient.get("/api/emergency/history"),
      () =>
        db()
          .emergencies.filter((e) => e.userId === currentUserId())
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    );
  },

  get(id: string): Promise<EmergencyEvent | null> {
    return call(
      () => apiClient.get(`/api/emergency/${id}`),
      () => db().emergencies.find((e) => e.id === id) ?? null,
    );
  },

  active(): Promise<EmergencyEvent | null> {
    return call(
      () => apiClient.get("/api/emergency/history"),
      () =>
        db().emergencies.find(
          (e) =>
            e.userId === currentUserId() &&
            (e.status === "ACTIVE" || e.status === "AUTO_ESCALATED"),
        ) ?? null,
    );
  },

  resolve(id: string): Promise<{ success: boolean }> {
    return call(
      () => apiClient.post(`/api/emergency/${id}/resolve`),
      () => {
        const event = db().emergencies.find((e) => e.id === id);
        if (event) {
          event.status = "RESOLVED";
          event.timeline.push({
            stage: "Resolution",
            detail: "Marked resolved by user",
            at: new Date().toISOString(),
          });
        }
        save();
        return { success: true };
      },
    );
  },

  cancel(id: string): Promise<{ success: boolean }> {
    return call(
      () => apiClient.post(`/api/emergency/${id}/cancel`),
      () => {
        const event = db().emergencies.find((e) => e.id === id);
        if (event) {
          event.status = "CANCELLED";
          event.timeline.push({
            stage: "Resolution",
            detail: "Cancelled by user (false alarm)",
            at: new Date().toISOString(),
          });
        }
        save();
        return { success: true };
      },
    );
  },
};

export const sosService = {
  trigger(simulated = false) {
    return emergencyService.trigger({
      triggerType: "MANUAL_SOS",
      riskLevel: "CRITICAL",
      simulated,
      detectionDetail: "Manual SOS button pressed",
      responseDetail: "User requested help",
    });
  },
};
