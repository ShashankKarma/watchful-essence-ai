import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { useGuardian } from "@/hooks/useGuardian";
import { monitoringService } from "@/services/monitoringService";
import { RiskBadge } from "@/components/RiskBadge";
import type { AiAnalysisResult } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/demo")({
  head: () => ({
    meta: [
      { title: "Demo Mode — GuardianAI" },
      {
        name: "description",
        content: "Run scripted scenarios: normal day, unusual movement and full emergency escalation.",
      },
      { property: "og:title", content: "Demo Mode — GuardianAI" },
      {
        property: "og:description",
        content: "Run scripted scenarios: normal day, unusual movement and full emergency escalation.",
      },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  const guardian = useGuardian();
  const [running, setRunning] = useState<string | null>(null);
  const [log, setLog] = useState<{ at: string; text: string }[]>([]);
  const [last, setLast] = useState<AiAnalysisResult | null>(null);

  const append = (text: string) =>
    setLog((l) => [{ at: new Date().toLocaleTimeString(), text }, ...l]);

  const run = async (key: string, fn: () => Promise<void>) => {
    setRunning(key);
    try {
      await fn();
    } finally {
      setRunning(null);
    }
  };

  const scenarios = [
    {
      key: "normal",
      title: "Normal day",
      description: "Records three routine samples — the score should stay in the LOW band.",
      action: async () => {
        if (!guardian.monitoring) await guardian.startMonitoring();
        for (let i = 0; i < 3; i += 1) {
          const result = await guardian.submitBehaviour(monitoringService.normalSample(true));
          setLast(result);
          append(`Normal sample analysed — score ${result.anomalyScore} (${result.riskLevel})`);
        }
        toast.success("Normal day scenario complete");
      },
    },
    {
      key: "unusual",
      title: "Unusual movement",
      description: "Late-night activity far from your usual places — expect MEDIUM/HIGH risk.",
      action: async () => {
        if (!guardian.monitoring) await guardian.startMonitoring();
        const result = await guardian.submitBehaviour(monitoringService.anomalousSample(true));
        setLast(result);
        append(`Anomalous sample analysed — score ${result.anomalyScore} (${result.riskLevel})`);
        toast.warning(`Anomaly detected: ${result.reasons[0]}`);
      },
    },
    {
      key: "emergency",
      title: "Emergency escalation",
      description:
        "Triggers a simulated SOS: location captured, trusted contacts notified, timeline created.",
      action: async () => {
        await guardian.triggerSos(true);
        append("Simulated SOS triggered — trusted contacts notified");
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Demo mode"
        description="Scripted scenarios that exercise the full detection-to-escalation pipeline."
      />

      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-caution/40 bg-caution/10 p-4 text-sm">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-caution" />
        <p className="text-muted-foreground">
          Everything created here is marked <strong className="text-caution">SIMULATED</strong>. No
          SMS, call or message is sent to any real person, and GuardianAI never contacts emergency
          services.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {scenarios.map((s) => (
          <div key={s.key} className="flex flex-col rounded-2xl border border-border bg-card p-5">
            <Sparkles className="h-5 w-5 text-accent" />
            <p className="mt-2 font-display text-base font-semibold">{s.title}</p>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{s.description}</p>
            <button
              onClick={() => void run(s.key, s.action)}
              disabled={running !== null}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-display font-bold text-primary-foreground disabled:opacity-60"
            >
              {running === s.key ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Run scenario
            </button>
          </div>
        ))}
      </div>

      {last ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display text-3xl font-bold">{last.anomalyScore}</span>
            <RiskBadge level={last.riskLevel} />
            <span className="text-sm text-muted-foreground">
              Confidence {Math.round(last.confidence * 100)}% · {last.source}
            </span>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {last.reasons.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <p className="font-display text-base font-semibold">Scenario log</p>
        <div className="mt-3 space-y-2 text-sm">
          {log.length === 0 ? (
            <p className="text-muted-foreground">Run a scenario to see the step-by-step log.</p>
          ) : (
            log.map((l, i) => (
              <p key={i} className="text-muted-foreground">
                <span className="mr-2 font-mono text-xs">{l.at}</span>
                {l.text}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
