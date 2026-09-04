import { ShieldCheck, Radar, Bell, Siren, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/types";

export type SafetyStatus =
  | "SAFE"
  | "MONITORING ACTIVE"
  | "ATTENTION REQUIRED"
  | "HIGH RISK"
  | "CRITICAL";

export function deriveStatus(
  monitoring: boolean,
  level: RiskLevel | undefined,
  emergencyActive: boolean,
): SafetyStatus {
  if (emergencyActive) return "CRITICAL";
  if (level === "CRITICAL") return "CRITICAL";
  if (level === "HIGH") return "HIGH RISK";
  if (level === "MEDIUM") return "ATTENTION REQUIRED";
  if (monitoring) return "MONITORING ACTIVE";
  return "SAFE";
}

const config: Record<SafetyStatus, { icon: typeof ShieldCheck; tone: string; text: string }> = {
  SAFE: { icon: ShieldCheck, tone: "border-safe/40 bg-safe/10 text-safe", text: "No unusual behaviour detected." },
  "MONITORING ACTIVE": {
    icon: Radar,
    tone: "border-accent/40 bg-accent/10 text-accent",
    text: "GuardianAI is monitoring your safety patterns.",
  },
  "ATTENTION REQUIRED": {
    icon: Bell,
    tone: "border-caution/40 bg-caution/10 text-caution",
    text: "Some behaviour differs mildly from your baseline.",
  },
  "HIGH RISK": {
    icon: ShieldAlert,
    tone: "border-danger/40 bg-danger/10 text-danger",
    text: "Strong deviation from your normal pattern detected.",
  },
  CRITICAL: {
    icon: Siren,
    tone: "border-critical/50 bg-critical/15 text-critical",
    text: "Emergency workflow is active.",
  },
};

export function SafetyStatusCard({ status }: { status: SafetyStatus }) {
  const { icon: Icon, tone, text } = config[status];
  return (
    <div className={cn("rounded-2xl border p-5", tone)}>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-background/40">
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-widest opacity-80">Current safety status</p>
          <p className="font-display text-xl font-bold">{status}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-foreground/80">{text}</p>
    </div>
  );
}
