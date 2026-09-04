import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState, LoadingState } from "@/components/StateViews";
import { notificationService } from "@/services/notificationService";
import type { AppNotification } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — GuardianAI" },
      { name: "description", content: "All in-app safety notifications and escalation updates." },
      { property: "og:title", content: "Notifications — GuardianAI" },
      {
        property: "og:description",
        content: "All in-app safety notifications and escalation updates.",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const load = () => notificationService.list().then(setItems);

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="In-app delivery only — SMS and push are simulated in this demo."
        action={
          <button
            onClick={async () => {
              await notificationService.markAllRead();
              await load();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold"
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        }
      />

      {items === null ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState title="No notifications" />
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={async () => {
                await notificationService.markRead(n.id);
                await load();
              }}
              className={`w-full rounded-2xl border bg-card p-4 text-left ${
                n.read ? "border-border opacity-70" : "border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <p className="font-display text-sm font-semibold">{n.title}</p>
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {n.type.replace(/_/g, " ")}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
