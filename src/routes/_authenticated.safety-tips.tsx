import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { SafetyTipCard } from "@/components/SafetyTipCard";
import { LoadingState } from "@/components/StateViews";
import { safetyTipService } from "@/services/safetyTipService";
import { cn } from "@/lib/utils";
import type { SafetyTip } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/safety-tips")({
  head: () => ({
    meta: [
      { title: "Safety Tips — GuardianAI" },
      {
        name: "description",
        content: "Practical personal-safety guidance grouped by category.",
      },
      { property: "og:title", content: "Safety Tips — GuardianAI" },
      { property: "og:description", content: "Practical personal-safety guidance grouped by category." },
    ],
  }),
  component: SafetyTipsPage,
});

function SafetyTipsPage() {
  const [tips, setTips] = useState<SafetyTip[] | null>(null);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    void safetyTipService.list().then(setTips);
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set((tips ?? []).map((t) => t.category)))],
    [tips],
  );

  const visible = (tips ?? []).filter((t) => category === "All" || t.category === category);

  return (
    <div>
      <PageHeader title="Safety tips" description="Small habits that make a real difference." />

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm",
              category === c
                ? "border-primary bg-primary/15 font-semibold text-primary"
                : "border-border text-muted-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {tips === null ? (
        <div className="mt-6">
          <LoadingState />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((t) => (
            <SafetyTipCard key={t.id} tip={t} />
          ))}
        </div>
      )}
    </div>
  );
}
