import { cn } from "@/lib/utils";
import type { EmergencyStatus, RiskLevel } from "@/lib/types";

const riskStyles: Record<RiskLevel, string> = {
  LOW: "bg-safe/15 text-safe border-safe/40",
  MEDIUM: "bg-caution/15 text-caution border-caution/40",
  HIGH: "bg-danger/15 text-danger border-danger/40",
  CRITICAL: "bg-critical/20 text-critical border-critical/50",
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        riskStyles[level],
        className,
      )}
    >
      {level}
    </span>
  );
}

const statusStyles: Record<EmergencyStatus, string> = {
  ACTIVE: "bg-critical/20 text-critical border-critical/50",
  AUTO_ESCALATED: "bg-danger/15 text-danger border-danger/40",
  RESOLVED: "bg-safe/15 text-safe border-safe/40",
  CANCELLED: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status }: { status: EmergencyStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        statusStyles[status],
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-demo/50 bg-demo/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-demo",
        className,
      )}
    >
      Demo / Simulated
    </span>
  );
}
