import { TriangleAlert } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RiskBadge, DemoBadge } from "./RiskBadge";
import type { SafetyAlert } from "@/lib/types";

export function AlertModal({
  alert,
  countdown,
  timeout,
  onSafe,
  onNeedHelp,
}: {
  alert: SafetyAlert | null;
  countdown: number;
  timeout: number;
  onSafe: () => void;
  onNeedHelp: () => void;
}) {
  if (!alert) return null;
  const pct = timeout > 0 ? (countdown / timeout) * 100 : 0;

  return (
    <Dialog open>
      <DialogContent
                className="border-danger/50 bg-card sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="text-center">
          {alert.simulated ? <DemoBadge className="mb-3" /> : null}
          <TriangleAlert className="mx-auto h-10 w-10 text-danger" />
          <h2 className="mt-3 font-display text-xl font-bold">UNUSUAL ACTIVITY DETECTED</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            GuardianAI detected behaviour that differs from your normal pattern.
          </p>

          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="font-display text-3xl font-bold">{alert.riskScore}</span>
            <RiskBadge level={alert.riskLevel} />
          </div>

          <ul className="mt-4 space-y-1 text-left text-sm text-foreground/80">
            {alert.reasons.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="text-danger">•</span>
                {r}
              </li>
            ))}
          </ul>

          <div className="mt-5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-danger transition-all duration-1000 ease-linear"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Auto escalation in <span className="font-semibold text-foreground">{countdown}s</span>{" "}
              if you do not respond
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={onSafe}
              className="rounded-xl bg-safe py-3 font-display font-bold text-safe-foreground"
            >
              I&apos;M SAFE
            </button>
            <button
              onClick={onNeedHelp}
              className="rounded-xl bg-primary py-3 font-display font-bold text-primary-foreground"
            >
              NEED HELP
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
