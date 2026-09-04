import { Lightbulb } from "lucide-react";
import type { SafetyTip } from "@/lib/types";

export function SafetyTipCard({ tip }: { tip: SafetyTip }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-accent">
        <Lightbulb className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-widest">{tip.category}</span>
      </div>
      <h3 className="mt-2 font-display text-base font-semibold">{tip.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{tip.description}</p>
    </article>
  );
}
