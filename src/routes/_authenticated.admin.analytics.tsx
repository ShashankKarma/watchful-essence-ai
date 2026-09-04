import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/StateViews";
import { DistributionChart, TrendChart } from "@/components/Charts";
import { adminService } from "@/services/adminService";
import type { AdminDashboard } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Admin Analytics — GuardianAI" },
      { name: "description", content: "Trends for alerts, emergencies and monitoring adoption." },
      { property: "og:title", content: "Admin Analytics — GuardianAI" },
      {
        property: "og:description",
        content: "Trends for alerts, emergencies and monitoring adoption.",
      },
    ],
  }),
  component: AdminAnalyticsPage,
});

function AdminAnalyticsPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);

  useEffect(() => {
    void adminService.dashboard().then(setData);
  }, []);

  if (!data) return <LoadingState />;

  const totalAlerts = data.alertsOverTime.reduce((s, d) => s + d.alerts, 0);
  const totalEmergencies = data.alertsOverTime.reduce((s, d) => s + d.emergencies, 0);
  const escalationRate = totalAlerts ? Math.round((totalEmergencies / totalAlerts) * 100) : 0;

  return (
    <div>
      <PageHeader title="Analytics" description="Aggregated trends over the last seven days." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Alerts (7d)" value={String(totalAlerts)} />
        <Kpi label="Emergencies (7d)" value={String(totalEmergencies)} />
        <Kpi label="Escalation rate" value={`${escalationRate}%`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-base font-semibold">Alert &amp; emergency trend</p>
          <div className="mt-3">
            <TrendChart
              data={data.alertsOverTime as unknown as Record<string, string | number>[]}
              series={[
                { key: "alerts", color: "var(--color-accent)", label: "Alerts" },
                { key: "emergencies", color: "var(--color-critical)", label: "Emergencies" },
              ]}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-base font-semibold">Risk distribution</p>
          <div className="mt-3">
            <DistributionChart data={data.riskDistribution} />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-5">
        <p className="font-display text-base font-semibold">Monitoring adoption</p>
        <div className="mt-3">
          <TrendChart
            data={data.monitoringActivity as unknown as Record<string, string | number>[]}
            series={[{ key: "sessions", color: "var(--color-safe)", label: "Sessions" }]}
          />
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}
