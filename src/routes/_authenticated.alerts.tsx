import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { RiskBadge, DemoBadge } from "@/components/RiskBadge";
import { EmptyState, LoadingState } from "@/components/StateViews";
import { RiskChart } from "@/components/Charts";
import { alertService } from "@/services/alertService";
import { aiService } from "@/services/aiService";
import { cn } from "@/lib/utils";
import type { RiskAssessment, SafetyAlert } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/alerts")({
  head: () => ({
    meta: [
      { title: "Alert History — GuardianAI" },
      {
        name: "description",
        content: "Every safety alert with its risk score, reasons, your response and outcome.",
      },
      { property: "og:title", content: "Alert History — GuardianAI" },
      {
        property: "og:description",
        content: "Every safety alert with its risk score, reasons, your response and outcome.",
      },
    ],
  }),
  component: AlertsPage,
});

const filters = ["All", "Low", "Medium", "High", "Critical", "Resolved", "Unresolved"] as const;

function AlertsPage() {
  const [alerts, setAlerts] = useState<SafetyAlert[] | null>(null);
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  useEffect(() => {
    void alertService.list().then(setAlerts);
    void aiService.riskHistory().then(setRisks);
  }, []);

  const filtered = useMemo(() => {
    if (!alerts) return [];
    switch (filter) {
      case "All":
        return alerts;
      case "Resolved":
        return alerts.filter((a) => a.status === "RESOLVED");
      case "Unresolved":
        return alerts.filter((a) => a.status !== "RESOLVED");
      default:
        return alerts.filter((a) => a.riskLevel === filter.toUpperCase());
    }
  }, [alerts, filter]);

  return (
    <div>
      <PageHeader title="Alert history" description="Safety alerts raised by the anomaly engine." />

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="font-display text-base font-semibold">Risk score over time</p>
        <div className="mt-3">
          {risks.length ? <RiskChart data={risks} /> : <EmptyState title="No risk history yet" />}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm",
              filter === f
                ? "border-primary bg-primary/15 font-semibold text-primary"
                : "border-border text-muted-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {alerts === null ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState title="No alerts in this filter" />
        ) : (
          filtered.map((a) => (
            <article key={a.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-2xl font-bold">{a.riskScore}</span>
                <RiskBadge level={a.riskLevel} />
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs">
                  {a.status}
                </span>
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs">
                  Response: {a.response.replace(/_/g, " ")}
                </span>
                {a.simulated ? <DemoBadge /> : null}
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {a.reasons.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
