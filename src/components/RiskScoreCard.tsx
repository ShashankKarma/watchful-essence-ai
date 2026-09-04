import { RiskBadge } from "./RiskBadge";
import type { RiskAssessment } from "@/lib/types";

export function RiskScoreCard({ risk }: { risk: RiskAssessment | null }) {
  const score = risk?.anomalyScore ?? 0;
  const pct = Math.min(100, Math.max(0, score));
  const tone =
    score > 80 ? "bg-critical" : score > 60 ? "bg-danger" : score > 30 ? "bg-caution" : "bg-safe";

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">AI risk score</p>
          <p className="mt-1 font-display text-4xl font-bold">{score}</p>
        </div>
        {risk ? <RiskBadge level={risk.riskLevel} /> : null}
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Confidence {Math.round((risk?.confidence ?? 0) * 100)}% · source {risk?.source ?? "LOCAL"}
      </p>
      {risk?.reasons?.length ? (
        <ul className="mt-3 space-y-1 text-sm text-foreground/80">
          {risk.reasons.slice(0, 3).map((r) => (
            <li key={r} className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              {r}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
