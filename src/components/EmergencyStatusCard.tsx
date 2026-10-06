import { Siren, MapPin, Users } from "lucide-react";
import { StatusBadge, DemoBadge } from "./RiskBadge";
import type { EmergencyEvent } from "@/lib/types";

export function EmergencyStatusCard({
  event,
  onResolve,
  onCancel,
}: {
  event: EmergencyEvent;
  onResolve: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-2xl border border-critical/50 bg-critical/10 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <Siren className="h-6 w-6 text-critical" />
        <p className="font-display text-lg font-bold text-critical">Emergency active</p>
        <StatusBadge status={event.status} />
        {event.simulated ? <DemoBadge /> : null}
      </div>
      <p className="mt-2 text-sm text-foreground/80">
        Trigger: {event.triggerType?.replace(/_/g, " ") ?? "Emergency alert"} ·{" "}
        {new Date(event.timestamp).toLocaleString()}
      </p>
      <div className="mt-3 grid gap-2 text-sm text-foreground/80 sm:grid-cols-2">
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          {event.latitude != null
            ? `${event.latitude.toFixed(5)}, ${event.longitude?.toFixed(5)}`
            : "No location captured"}
        </p>
        <p className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          {event.notifiedContactIds?.length ?? 0} trusted contact(s) notified (simulated)
        </p>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={onResolve}
          className="rounded-xl bg-safe px-4 py-2 text-sm font-semibold text-safe-foreground"
        >
          Mark resolved
        </button>
        <button
          onClick={onCancel}
          className="rounded-xl border border-border px-4 py-2 text-sm font-semibold"
        >
          False alarm
        </button>
      </div>
    </div>
  );
}
