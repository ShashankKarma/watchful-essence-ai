import { apiClient, call } from "./apiClient";
import { db, save } from "@/lib/demoStore";
import { currentUserId } from "./session";
import type { User, UserSettings } from "@/lib/types";

export const userService = {
  profile(): Promise<User | null> {
    return call(
      () => apiClient.get("/api/profile"),
      () => db().users.find((u) => u.id === currentUserId()) ?? null,
    );
  },

  updateProfile(payload: Partial<Pick<User, "name" | "phone" | "emergencyPin">>): Promise<User> {
    return call(
      () => apiClient.put("/api/profile", payload),
      () => {
        const user = db().users.find((u) => u.id === currentUserId());
        if (!user) throw new Error("User not found");
        Object.assign(user, payload, { updatedAt: new Date().toISOString() });
        save();
        return user;
      },
    );
  },

  changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    return call(
      () => apiClient.post("/api/profile/password", { currentPassword, newPassword }),
      () => {
        const user = db().users.find((u) => u.id === currentUserId());
        if (!user) throw new Error("User not found");
        if (user.password && user.password !== currentPassword) {
          throw new Error("Current password is incorrect");
        }
        user.password = newPassword;
        save();
        return { success: true };
      },
    );
  },

  settings(): Promise<UserSettings> {
    return call(
      () => apiClient.get("/api/settings"),
      () => {
        const data = db();
        const userId = currentUserId();
        let settings = data.settings.find((s) => s.userId === userId);
        if (!settings) {
          settings = {
            userId,
            riskSensitivity: 1,
            alertTimeoutSeconds: 30,
            locationSharing: true,
            monitoringEnabled: false,
            notifyInApp: true,
            notifySms: false,
            notifyEmail: false,
            shareLocationWithContacts: true,
            storeBehaviourHistory: true,
          };
          data.settings.push(settings);
          save();
        }
        return settings;
      },
    );
  },

  async updateSettings(payload: Partial<UserSettings>): Promise<UserSettings> {
    const current = await userService.settings();
    return call(
      () => apiClient.put("/api/settings", payload),
      () => {
        Object.assign(current, payload);
        save();
        return current;
      },
    );
  },
};
