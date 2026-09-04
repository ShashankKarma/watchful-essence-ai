import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { notificationService } from "@/services/notificationService";
import { useGuardian } from "@/hooks/useGuardian";
import type { AppNotification } from "@/lib/types";

const toneFor: Record<AppNotification["type"], string> = {
  INFO: "text-accent",
  WARNING: "text-caution",
  HIGH_RISK: "text-danger",
  EMERGENCY: "text-critical",
  SYSTEM: "text-muted-foreground",
};

export function NotificationPanel() {
  const { version } = useGuardian();
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    void notificationService.list().then(setItems);
  }, [version]);

  const unread = items.filter((n) => n.status === "UNREAD").length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-card"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unread}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="font-display text-sm font-semibold">Notifications</p>
          <button
            className="text-xs text-accent"
            onClick={async () => {
              await notificationService.markAllRead();
              setItems(await notificationService.list());
            }}
          >
            Mark all read
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">Nothing yet</p>
          ) : (
            items.slice(0, 12).map((n) => (
              <button
                key={n.id}
                onClick={async () => {
                  await notificationService.markRead(n.id);
                  setItems(await notificationService.list());
                }}
                className="block w-full border-b border-border/60 px-4 py-3 text-left last:border-0 hover:bg-muted/50"
              >
                <p className={`text-sm font-semibold ${toneFor[n.type]}`}>{n.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  {new Date(n.createdAt).toLocaleString()}
                  {n.status === "UNREAD" ? " · unread" : ""}
                </p>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
