import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BehaviourData, RiskAssessment } from "@/lib/types";

const axis = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
};

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  color: "var(--color-popover-foreground)",
  fontSize: 12,
};

export function RiskChart({ data }: { data: RiskAssessment[] }) {
  const points = data.map((r) => ({
    time: new Date(r.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit" }),
    score: r.anomalyScore,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={points} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="time" {...axis} tickLine={false} minTickGap={24} />
        <YAxis domain={[0, 100]} {...axis} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey="score"
          stroke="var(--color-chart-1)"
          strokeWidth={2}
          fill="url(#riskFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BehaviourChart({ data }: { data: BehaviourData[] }) {
  const counts: Record<string, number> = {};
  data.forEach((b) => (counts[b.activityType] = (counts[b.activityType] ?? 0) + 1));
  const points = Object.entries(counts).map(([activity, count]) => ({ activity, count }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={points} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="activity" {...axis} tickLine={false} />
        <YAxis {...axis} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="var(--color-chart-2)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DistributionChart({ data }: { data: { level: string; count: number }[] }) {
  const colors: Record<string, string> = {
    LOW: "var(--color-safe)",
    MEDIUM: "var(--color-caution)",
    HIGH: "var(--color-danger)",
    CRITICAL: "var(--color-critical)",
  };
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="level" {...axis} tickLine={false} />
        <YAxis {...axis} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.level} fill={colors[d.level] ?? "var(--color-chart-2)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendChart({
  data,
  series,
}: {
  data: Record<string, string | number>[];
  series: { key: string; color: string; label: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" {...axis} tickLine={false} />
        <YAxis {...axis} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
