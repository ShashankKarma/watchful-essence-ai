import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useGuardian } from "@/hooks/useGuardian";
import { LoadingState } from "@/components/StateViews";
import { resetDemoData } from "@/lib/demoStore";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — GuardianAI" },
      {
        name: "description",
        content: "Tune anomaly sensitivity, alert countdown, notifications and demo mode.",
      },
      { property: "og:title", content: "Settings — GuardianAI" },
      {
        property: "og:description",
        content: "Tune anomaly sensitivity, alert countdown, notifications and demo mode.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, saveSettings } = useGuardian();
  if (!settings) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Settings" description="Control how GuardianAI monitors and alerts you." />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-6 rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-base font-semibold">Detection</p>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Anomaly sensitivity</label>
              <span className="font-display text-sm font-bold">{settings.riskSensitivity}%</span>
            </div>
            <Slider
              className="mt-3"
              min={10}
              max={100}
              step={5}
              value={[settings.riskSensitivity]}
              onValueChange={([v]) => void saveSettings({ riskSensitivity: v ?? 50 })}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Higher sensitivity raises anomaly scores for smaller deviations from your baseline.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Alert response countdown</label>
              <span className="font-display text-sm font-bold">{settings.alertTimeoutSeconds}s</span>
            </div>
            <Slider
              className="mt-3"
              min={10}
              max={120}
              step={5}
              value={[settings.alertTimeoutSeconds]}
              onValueChange={([v]) => void saveSettings({ alertTimeoutSeconds: v ?? 30 })}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              If you do not respond within this window the alert auto-escalates to an emergency.
            </p>
          </div>

          <Toggle
            label="Store behaviour history"
            description="Keep behaviour samples so the Digital Twin can keep learning."
            checked={settings.storeBehaviourHistory}
            onChange={(v) => void saveSettings({ storeBehaviourHistory: v })}
          />
        </div>

        <div className="space-y-6 rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-base font-semibold">Notifications & privacy</p>
          <Toggle
            label="In-app notifications"
            description="Alerts, escalations and contact updates."
            checked={settings.notifyInApp}
            onChange={(v) => void saveSettings({ notifyInApp: v })}
          />
          <Toggle
            label="Location tracking"
            description="Store location points for maps and emergency sharing."
            checked={settings.locationSharing}
            onChange={(v) => void saveSettings({ locationSharing: v })}
          />
          <Toggle
            label="Share location with trusted contacts"
            description="Include coordinates in emergency notifications."
            checked={settings.shareLocationWithContacts}
            onChange={(v) => void saveSettings({ shareLocationWithContacts: v })}
          />
          <Toggle
            label="Monitoring enabled"
            description="Allow GuardianAI to analyse behaviour samples."
            checked={settings.monitoringEnabled}
            onChange={(v) => void saveSettings({ monitoringEnabled: v })}
          />

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium">Reset demo data</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Restores seeded users, contacts, behaviour history and alerts.
            </p>
            <button
              onClick={() => {
                resetDemoData();
                toast.success("Demo data reset");
                window.location.reload();
              }}
              className="mt-3 rounded-xl border border-critical/50 px-4 py-2 text-sm font-semibold text-critical"
            >
              Reset now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
