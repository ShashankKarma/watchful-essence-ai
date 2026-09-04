import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Users, BellRing, History, Play, Square } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGuardian } from "@/hooks/useGuardian";
import { PageHeader } from "@/components/PageHeader";
import { SafetyStatusCard, deriveStatus } from "@/components/SafetyStatusCard";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { DigitalTwinCard } from "@/components/DigitalTwinCard";
import { SOSButton } from "@/components/SOSButton";
import { EmergencyStatusCard } from "@/components/EmergencyStatusCard";
import { RiskBadge, StatusBadge } from "@/components/RiskBadge";
import { aiService } from "@/services/aiService";
import { contactService } from "@/services/contactService";
import { alertService } from "@/services/alertService";
import { emergencyService } from "@/services/emergencyService";
import { locationService } from "@/services/locationService";
import type {
  DigitalTwin,
  EmergencyEvent,
  LocationData,
  SafetyAlert,
  TrustedContact,
} from "@/lib/types";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Safety Dashboard — GuardianAI" },
      {
        name: "description",
        content: "Live safety status, AI risk score, monitoring controls and emergency SOS.",
      },
      { property: "og:title", content: "Safety Dashboard — GuardianAI" },
      {
        property: "og:description",
        content: "Live safety status, AI risk score, monitoring controls and emergency SOS.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const guardian = useGuardian();
  const [twin, setTwin] = useState<DigitalTwin | null>(null);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [events, setEvents] = useState<EmergencyEvent[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    void Promise.all([
      aiService.digitalTwin(),
      contactService.list(),
      alertService.list(),
      emergencyService.history(),
      locationService.current(),
    ]).then(([t, c, a, e, l]) => {
      setTwin(t);
      setContacts(c);
      setAlerts(a);
      setEvents(e);
      setLocation(l);
    });
  }, [guardian.version]);

  const status = deriveStatus(
    guardian.monitoring,
    guardian.latestRisk?.riskLevel,
    Boolean(guardian.activeEmergency),
  );

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0]}`}
        description="GuardianAI is monitoring your safety patterns."
      />

      {guardian.activeEmergency ? (
        <div className="mb-6">
          <EmergencyStatusCard
            event={guardian.activeEmergency}
            onResolve={() => void guardian.resolveEmergency(guardian.activeEmergency!.id)}
            onCancel={() => void guardian.cancelEmergency(guardian.activeEmergency!.id)}
          />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <SafetyStatusCard status={status} />
        <RiskScoreCard risk={guardian.latestRisk} />
        <DigitalTwinCard twin={twin} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={MapPin}
          label="Current location"
          value={
            location ? `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}` : "—"
          }
          hint={location ? new Date(location.timestamp).toLocaleTimeString() : "No fix yet"}
          to="/location"
        />
        <StatCard
          icon={Users}
          label="Trusted contacts"
          value={String(contacts.length)}
          hint={`${contacts.filter((c) => c.notificationEnabled).length} will be notified`}
          to="/trusted-contacts"
        />
        <StatCard
          icon={BellRing}
          label="Recent alerts"
          value={String(alerts.length)}
          hint={alerts[0] ? `Last: ${alerts[0].riskLevel}` : "No alerts yet"}
          to="/alerts"
        />
        <StatCard
          icon={History}
          label="Emergency history"
          value={String(events.length)}
          hint={events[0] ? events[0].status.replace(/_/g, " ") : "None recorded"}
          to="/emergency-history"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Monitoring</p>
          <p className="mt-1 font-display text-lg font-bold">
            {guardian.monitoring ? "Monitoring active" : "Monitoring paused"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Behaviour samples are compared with your Digital Twin baseline in real time.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => void guardian.startMonitoring()}
              disabled={guardian.monitoring}
              className="inline-flex items-center gap-2 rounded-xl bg-safe px-5 py-3 font-display font-bold text-safe-foreground disabled:opacity-50"
            >
              <Play className="h-4 w-4" /> START MONITORING
            </button>
            <button
              onClick={() => void guardian.stopMonitoring()}
              disabled={!guardian.monitoring}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 font-display font-bold disabled:opacity-50"
            >
              <Square className="h-4 w-4" /> STOP MONITORING
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Emergency</p>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Sends your latest location to trusted contacts (simulated).
          </p>
          <SOSButton onTrigger={() => guardian.triggerSos(false)} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <p className="font-display text-base font-semibold">Recent alerts</p>
          <Link to="/alerts" className="text-sm text-accent">
            View all
          </Link>
        </div>
        <div className="mt-3 space-y-2">
          {alerts.slice(0, 4).map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-lg font-bold">{a.riskScore}</span>
                <RiskBadge level={a.riskLevel} />
                <span className="text-sm text-muted-foreground">{a.reasons[0]}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(a.createdAt).toLocaleString()} · {a.response}
              </span>
            </div>
          ))}
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No alerts recorded yet.</p>
          ) : null}
        </div>
      </div>

      {events[0] ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-sm font-semibold">Last emergency event</p>
          <StatusBadge status={events[0].status} />
          <span className="text-sm text-muted-foreground">
            {events[0].triggerType.replace(/_/g, " ")} ·{" "}
            {new Date(events[0].timestamp).toLocaleString()}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  to,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  hint: string;
  to: "/location" | "/trusted-contacts" | "/alerts" | "/emergency-history";
}) {
  return (
    <Link to={to} className="rounded-2xl border border-border bg-card p-4 hover:border-accent/50">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-2 font-display text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </Link>
  );
}
