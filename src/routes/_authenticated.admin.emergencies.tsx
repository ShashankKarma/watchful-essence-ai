import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState, EmptyState } from "@/components/StateViews";
import { StatusBadge, RiskBadge, DemoBadge } from "@/components/RiskBadge";
import { EmergencyTimeline } from "@/components/Timelines";
import { adminService } from "@/services/adminService";
import type { EmergencyEvent } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/emergencies")({
  head: () => ({
    meta: [
      { title: "Admin Emergencies — GuardianAI" },
      { name: "description", content: "All emergency events across the platform with timelines." },
      { property: "og:title", content: "Admin Emergencies — GuardianAI" },
      {
        property: "og:description",
        content: "All emergency events across the platform with timelines.",
      },
    ],
  }),
  component: AdminEmergenciesPage,
});

function AdminEmergenciesPage() {
  const [events, setEvents] = useState<EmergencyEvent[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    void adminService.emergencies().then(setEvents);
  }, []);

  if (!events) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Emergency events" description="Platform-wide escalation monitoring." />
      {events.length === 0 ? (
        <EmptyState title="No emergency events recorded" />
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="rounded-2xl border border-border bg-card p-5">
              <button
                className="flex w-full flex-wrap items-center gap-3 text-left"
                onClick={() => setOpenId(openId === e.id ? null : e.id)}
              >
                <span className="font-mono text-xs text-muted-foreground">#{e.id.slice(0, 8)}</span>
                <StatusBadge status={e.status} />
                <RiskBadge level={e.riskLevel} />
                {e.simulated ? <DemoBadge /> : null}
                <span className="text-sm">{e.triggerType.replace(/_/g, " ")}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(e.timestamp).toLocaleString()}
                </span>
              </button>
              {openId === e.id ? (
                <div className="mt-4 border-t border-border pt-4">
                  <EmergencyTimeline entries={e.timeline} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
