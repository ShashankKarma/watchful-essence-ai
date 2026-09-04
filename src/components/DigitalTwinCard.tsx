import { BrainCircuit } from "lucide-react";
import type { DigitalTwin } from "@/lib/types";

export function DigitalTwinCard({ twin }: { twin: DigitalTwin | null }) {
  const progress = twin?.learningProgress ?? 0;
  const status = progress >= 80 ? "ACTIVE" : "LEARNING";

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
            <BrainCircuit className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Digital Twin</p>
            <p className="font-display text-lg font-bold">{status}</p>
          </div>
        </div>
        <span className="font-display text-2xl font-bold">{progress}%</span>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Learning progress from your behavioural history · last updated{" "}
        {twin ? new Date(twin.lastUpdated).toLocaleString() : "—"}
      </p>
    </div>
  );
}
