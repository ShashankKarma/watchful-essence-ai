import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Play, Square, Activity, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { useGuardian } from "@/hooks/useGuardian";
import { monitoringService } from "@/services/monitoringService";
import { locationService } from "@/services/locationService";
import { BehaviourChart } from "@/components/Charts";
import { ActivityTimeline } from "@/components/Timelines";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { EmptyState } from "@/components/StateViews";
import type { BehaviourData } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/monitoring")({
  head: () => ({
    meta: [
      { title: "Behaviour Monitoring — GuardianAI" },
      {
        name: "description",
        content: "Start or stop monitoring and record behaviour samples analysed against your baseline.",
      },
      { property: "og:title", content: "Behaviour Monitoring — GuardianAI" },
      {
        property: "og:description",
        content: "Start or stop monitoring and record behaviour samples analysed against your baseline.",
      },
    ],
  }),
  component: MonitoringPage,
});

function MonitoringPage() {
  const guardian = useGuardian();
  const [history, setHistory] = useState<BehaviourData[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void monitoringService.history().then(setHistory);
  }, [guardian.version]);

  const capture = async (kind: "normal" | "unusual" | "live") => {
    setBusy(true);
    try {
      let sample = kind === "normal" ? monitoringService.normalSample() : monitoringService.anomalousSample(false);
      if (kind === "live") {
        try {
          const pos = await locationService.readBrowserLocation();
          sample = {
            ...monitoringService.normalSample(),
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Location unavailable", {
            description: "Using your last known position instead.",
          });
        }
      }
      const result = await guardian.submitBehaviour(sample);
      toast.success(`Analysed — score ${result.anomalyScore} (${result.riskLevel})`, {
        description: result.reasons[0],
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Behaviour monitoring"
        description="Each sample is scored against your Digital Twin baseline — no random values."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest">Session</span>
          </div>
          <p className="mt-1 font-display text-xl font-bold">
            {guardian.monitoring ? "Monitoring active" : "Monitoring paused"}
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

          <div className="mt-6 border-t border-border pt-4">
            <p className="font-display text-sm font-semibold">Record a behaviour sample</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <SampleButton label="Use my live location" onClick={() => capture("live")} busy={busy} />
              <SampleButton label="Normal activity" onClick={() => capture("normal")} busy={busy} />
              <SampleButton label="Unusual activity" onClick={() => capture("unusual")} busy={busy} />
            </div>
          </div>
        </div>

        <RiskScoreCard risk={guardian.latestRisk} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-base font-semibold">Activity mix</p>
          <div className="mt-3">
            {history.length ? (
              <BehaviourChart data={history} />
            ) : (
              <EmptyState title="No behaviour recorded" />
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-base font-semibold">Recent samples</p>
          <div className="mt-3 max-h-80 overflow-y-auto pr-1">
            {history.length ? (
              <ActivityTimeline items={history.slice(0, 12)} />
            ) : (
              <EmptyState title="Nothing captured yet" description="Record a sample to begin." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SampleButton({
  label,
  onClick,
  busy,
}: {
  label: string;
  onClick: () => void;
  busy: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      {label}
    </button>
  );
}
