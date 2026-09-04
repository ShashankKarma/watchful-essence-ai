import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, Clock, Route as RouteIcon, MapPin, Repeat } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { DigitalTwinCard } from "@/components/DigitalTwinCard";
import { BehaviourChart } from "@/components/Charts";
import { LoadingState } from "@/components/StateViews";
import { aiService } from "@/services/aiService";
import { monitoringService } from "@/services/monitoringService";
import type { BehaviourData, DigitalTwin } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/digital-twin")({
  head: () => ({
    meta: [
      { title: "AI Digital Twin — GuardianAI" },
      {
        name: "description",
        content: "Your behavioural baseline: active hours, usual places, movement and activity mix.",
      },
      { property: "og:title", content: "AI Digital Twin — GuardianAI" },
      {
        property: "og:description",
        content: "Your behavioural baseline: active hours, usual places, movement and activity mix.",
      },
    ],
  }),
  component: DigitalTwinPage,
});

function DigitalTwinPage() {
  const [twin, setTwin] = useState<DigitalTwin | null>(null);
  const [history, setHistory] = useState<BehaviourData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [t, h] = await Promise.all([aiService.digitalTwin(), monitoringService.history()]);
    setTwin(t);
    setHistory(h);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <LoadingState label="Loading your Digital Twin…" />;

  const hours = twin?.baselineActiveHours ?? [];

  return (
    <div>
      <PageHeader
        title="AI Digital Twin"
        description="A behavioural model of your normal routine, learned from your own history."
        action={
          <button
            onClick={async () => {
              await aiService.rebuildTwin();
              await load();
              toast.success("Baseline refreshed from behaviour history");
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold"
          >
            <RefreshCw className="h-4 w-4" /> Retrain baseline
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <DigitalTwinCard twin={twin} />
        <Metric
          icon={Clock}
          label="Typical active hours"
          value={hours.length ? `${hours[0]}:00 – ${hours[hours.length - 1]}:00` : "Learning"}
          hint={`${hours.length} active hour slots learned`}
        />
        <Metric
          icon={RouteIcon}
          label="Typical movement"
          value={`${twin?.baselineMovementDuration ?? 0} min`}
          hint="Average movement duration per sample"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-base font-semibold">Active-hours profile</p>
          <div className="mt-4 grid grid-cols-12 gap-1">
            {Array.from({ length: 24 }).map((_, h) => (
              <div
                key={h}
                title={`${h}:00`}
                className={`h-8 rounded-md ${hours.includes(h) ? "bg-accent/70" : "bg-muted"}`}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Highlighted blocks are hours where you are normally active. Activity far outside these
            hours increases the anomaly score.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-base font-semibold">Typical activity frequency</p>
          <div className="mt-3">
            <BehaviourChart data={history} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-base font-semibold">Usual locations</p>
          <ul className="mt-3 space-y-2">
            {(twin?.usualLocations ?? []).map((p) => (
              <li key={p.label} className="flex items-center gap-3 rounded-xl border border-border/70 px-4 py-3">
                <MapPin className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm font-semibold">{p.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}
                  </p>
                </div>
              </li>
            ))}
            {(twin?.usualLocations ?? []).length === 0 ? (
              <li className="text-sm text-muted-foreground">Still learning your usual places.</li>
            ) : null}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-base font-semibold">How scoring works</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Repeat className="mt-0.5 h-4 w-4 text-accent" /> Hour-of-day deviation — up to 30 points
            </li>
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-accent" /> Distance from usual places — up to 30 points
            </li>
            <li className="flex gap-2">
              <RouteIcon className="mt-0.5 h-4 w-4 text-accent" /> Movement duration deviation — up to 25 points
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-accent" /> Rare activity type — up to 15 points
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            0–30 LOW · 31–60 MEDIUM · 61–80 HIGH · 81–100 CRITICAL. Alert threshold:{" "}
            {twin?.riskThreshold ?? 61}.
          </p>
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
