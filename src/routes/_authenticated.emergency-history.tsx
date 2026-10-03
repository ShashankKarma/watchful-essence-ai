import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge, RiskBadge, DemoBadge } from "@/components/RiskBadge";
import { EmergencyTimeline } from "@/components/Timelines";
import { EmptyState, LoadingState } from "@/components/StateViews";
import { emergencyService } from "@/services/emergencyService";
import { useGuardian } from "@/hooks/useGuardian";
import type { EmergencyEvent } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/emergency-history")({
  head: () => ({
    meta: [
      { title: "Emergency History — GuardianAI" },
      {
        name: "description",
        content: "All emergency events with trigger, risk level, location and full escalation timeline.",
      },
      { property: "og:title", content: "Emergency History — GuardianAI" },
      {
        property: "og:description",
        content: "All emergency events with trigger, risk level, location and full escalation timeline.",
      },
    ],
  }),
  component: EmergencyHistoryPage,
});

function EmergencyHistoryPage() {
  const guardian = useGuardian();
  const [events, setEvents] = useState<EmergencyEvent[] | null>(null);
  const [selected, setSelected] = useState<EmergencyEvent | null>(null);

  useEffect(() => {
    void emergencyService.history().then((list) => {
      setEvents(list);
      setSelected((current) => list.find((e) => e.id === current?.id) ?? list[0] ?? null);
    });
  }, [guardian.version]);

  return (
    <div>
      <PageHeader
        title="Emergency history"
        description="Detection → alert → response → escalation → notification → resolution."
      />

      {events === null ? (
        <LoadingState />
      ) : events.length === 0 ? (
        <EmptyState title="No emergency events" description="Nothing has been escalated yet." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="space-y-3 lg:col-span-3">
            {events.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className={`w-full rounded-2xl border bg-card p-4 text-left ${
                  selected?.id === e.id ? "border-primary" : "border-border"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">#{e.id.slice(0, 8)}</span>
                  <StatusBadge status={e.status} />
                  <RiskBadge level={e.riskLevel} />
                  {e.simulated ? <DemoBadge /> : null}
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-sm font-semibold">{e.triggerType.replace(/_/g, " ")}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(e.timestamp).toLocaleString()} ·{" "}
                  {e.latitude != null
                    ? `${e.latitude.toFixed(4)}, ${e.longitude?.toFixed(4)}`
                    : "No location"}
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
            {selected ? (
              <>
                <p className="font-display text-base font-semibold">Event details</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selected.timeline.find((entry) => entry.stage === "Contact Notification")?.detail
                    ?? `${selected.notifiedContactIds.length} contact(s) were included in the notification attempt.`}
                </p>
                <div className="mt-4">
                  <EmergencyTimeline entries={selected.timeline} />
                </div>
                {selected.status === "ACTIVE" || selected.status === "AUTO_ESCALATED" ? (
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => void guardian.resolveEmergency(selected.id)}
                      className="rounded-xl bg-safe px-4 py-2 text-sm font-semibold text-safe-foreground"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => void guardian.cancelEmergency(selected.id)}
                      className="rounded-xl border border-border px-4 py-2 text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
