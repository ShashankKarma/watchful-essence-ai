import { useState } from "react";
import { Siren } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "./ConfirmDialog";

export function SOSButton({
  onTrigger,
  variant = "block",
  className,
}: {
  onTrigger: () => Promise<void> | void;
  variant?: "block" | "floating";
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Emergency SOS"
        className={cn(
          "pulse-ring bg-primary text-primary-foreground transition-transform active:scale-95",
          variant === "block"
            ? "flex w-full items-center justify-center gap-3 rounded-2xl py-6 font-display text-xl font-bold tracking-wide"
            : "fixed bottom-20 right-4 z-40 grid h-16 w-16 place-items-center rounded-full shadow-lg md:bottom-8 md:right-8",
          className,
        )}
      >
        <Siren className={variant === "block" ? "h-6 w-6" : "h-7 w-7"} />
        {variant === "block" ? "EMERGENCY SOS" : null}
      </button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Trigger emergency SOS?"
         description="This creates an emergency event, captures your latest location when available and sends SMS alerts to enabled trusted contacts when the live backend is configured. Demo mode stays simulated."
        confirmLabel="Trigger SOS"
        destructive
        onConfirm={async () => {
          await onTrigger();
          setOpen(false);
        }}
      />
    </>
  );
}
