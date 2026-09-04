import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Users, Activity, BellRing, ShieldAlert, Siren } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/StateViews";
import { DistributionChart, TrendChart } from "@/components/Charts";
import { adminService } from "@/services/adminService";
import type { AdminDashboard } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Overview — GuardianAI" },
      { name: "description", content: "Platform-wide safety metrics, risk distribution and trends." },
      { property: "og:title", content: "Admin Overview — GuardianAI" },
      {
        property: "og:description",
        content: "Platform-wide safety metrics, risk distribution and trends.",
      },
    ],
  }),
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);

  useEffect(() => {
    void adminService.dashboard().then(setData);
  }, []);

  if (!data) return <LoadingState label="Loading admin metrics…" />;

  const stats = [
    { icon: Users, label: "Total users", value: data.totalUsers },
    { icon: Activity, label: "Active sessions", value: data.activeMonitoringSessions },
    { icon: BellRing, label: "Alerts today", value: data.alertsToday },
    { icon: ShieldAlert, label: "High-risk events", value: data.highRiskEvents },
    { icon: Siren, label: "Emergency events", value: data.emergencyEvents },
  ];

  return (
    <div>
      <PageHeader title="Admin overview" description="Aggregated, anonymised platform metrics." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <s.icon className="h-4 w-4" />
              <span className="text-xs uppercase tracking-widest">{s.label}</span>
            </div>
            <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-base font-semibold">Risk level distribution</p>
          <div className="mt-3">
            <DistributionChart data={data.riskDistribution} />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-base font-semibold">Alerts vs emergencies (7 days)</p>
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
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-5">
        <p className="font-display text-base font-semibold">Monitoring sessions (7 days)</p>
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
