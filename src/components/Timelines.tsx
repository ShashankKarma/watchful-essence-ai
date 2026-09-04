import { cn } from "@/lib/utils";
import type { BehaviourData, TimelineEntry } from "@/lib/types";

export function EmergencyTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative space-y-5 border-l border-border pl-5">
      {entries.map((entry, i) => (
        <li key={`${entry.stage}-${i}`} className="relative">
          <span
            className={cn(
              "absolute -left-[27px] top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-background",
              i === entries.length - 1 ? "bg-safe" : "bg-primary",
            )}
          />
          <p className="font-display text-sm font-semibold">{entry.stage}</p>
          <p className="text-sm text-muted-foreground">{entry.detail}</p>
          <p className="mt-0.5 text-xs text-muted-foreground/70">
            {new Date(entry.at).toLocaleString()}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function ActivityTimeline({ items }: { items: BehaviourData[] }) {
  return (
    <ol className="space-y-3">
      {items.map((b) => (
        <li
          key={b.id}
          className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-3"
        >
          <div>
            <p className="font-display text-sm font-semibold">{b.activityType}</p>
            <p className="text-xs text-muted-foreground">
              {b.latitude.toFixed(4)}, {b.longitude.toFixed(4)} · {b.movementDuration} min movement
            </p>
          </div>
          <p className="text-xs text-muted-foreground">{new Date(b.timestamp).toLocaleString()}</p>
        </li>
      ))}
    </ol>
  );
}
