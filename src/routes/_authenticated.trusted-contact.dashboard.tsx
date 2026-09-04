import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HeartHandshake } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge, RiskBadge, DemoBadge } from "@/components/RiskBadge";
import { EmergencyTimeline } from "@/components/Timelines";
import { EmptyState, LoadingState } from "@/components/StateViews";
import { LocationMap } from "@/components/LocationMap";
import { adminService } from "@/services/adminService";
import type { EmergencyEvent } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/trusted-contact/dashboard")({
  head: () => ({
    meta: [
      { title: "Trusted Contact Dashboard — GuardianAI" },
      {
        name: "description",
        content: "Emergency events shared with you, including last known location and timeline.",
      },
      { property: "og:title", content: "Trusted Contact Dashboard — GuardianAI" },
      {
        property: "og:description",
        content: "Emergency events shared with you, including last known location and timeline.",
      },
    ],
  }),
  component: TrustedContactDashboard,
});

function TrustedContactDashboard() {
  const [events, setEvents] = useState<EmergencyEvent[] | null>(null);

  useEffect(() => {
    void adminService.emergencies().then(setEvents);
  }, []);

  if (!events) return <LoadingState />;

  const active = events.filter((e) => e.status === "ACTIVE" || e.status === "AUTO_ESCALATED");
  const withLocation = events.find((e) => e.latitude != null);

  return (
    <div>
      <PageHeader
        title="Trusted contact dashboard"
        description="Alerts shared with you by the people who trust you."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <HeartHandshake className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest">Active emergencies</span>
          </div>
          <p className="mt-2 font-display text-3xl font-bold">{active.length}</p>
          <p className="text-xs text-muted-foreground">{events.length} total events shared</p>
        </div>

        <div className="lg:col-span-2">
          {withLocation?.latitude != null && withLocation.longitude != null ? (
            <LocationMap
              points={[
                {
                  id: withLocation.id,
                  userId: withLocation.userId,
                  latitude: withLocation.latitude,
                  longitude: withLocation.longitude,
                  accuracy: 20,
                  timestamp: withLocation.timestamp,
                },
              ]}
              height={220}
            />
          ) : (
            <EmptyState title="No shared location" description="No coordinates were attached to these events." />
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {events.length === 0 ? (
          <EmptyState title="Nothing shared with you yet" />
        ) : (
          events.map((e) => (
            <div key={e.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={e.status} />
                <RiskBadge level={e.riskLevel} />
                {e.simulated ? <DemoBadge /> : null}
                <span className="text-sm">{e.triggerType.replace(/_/g, " ")}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(e.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="mt-4">
                <EmergencyTimeline entries={e.timeline} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
