import { apiClient, call } from "./apiClient";
import { db, save, uid } from "@/lib/demoStore";
import { currentUserId } from "./session";
import type { AppNotification, NotificationType } from "@/lib/types";

export const notificationService = {
  list(): Promise<AppNotification[]> {
    return call(
      () => apiClient.get("/api/notifications"),
      () =>
        db()
          .notifications.filter((n) => n.userId === currentUserId())
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  markRead(id: string): Promise<{ success: boolean }> {
    return call(
      () => apiClient.post(`/api/notifications/${id}/read`),
      () => {
        const notification = db().notifications.find((n) => n.id === id);
        if (notification) notification.status = "READ";
        save();
        return { success: true };
      },
    );
  },

  markAllRead(): Promise<{ success: boolean }> {
    const data = db();
    data.notifications
      .filter((n) => n.userId === currentUserId())
      .forEach((n) => (n.status = "READ"));
    save();
    return Promise.resolve({ success: true });
  },

  /** Local channel used by the demo workflow (SMS/email are stubs). */
  push(type: NotificationType, title: string, message: string, emergencyEventId?: string) {
    const data = db();
    data.notifications.unshift({
      id: uid(),
      userId: currentUserId(),
      type,
      title,
      message,
      emergencyEventId,
      status: "UNREAD",
      createdAt: new Date().toISOString(),
    });
    save();
  },
};
