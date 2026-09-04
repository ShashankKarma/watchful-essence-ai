import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { aiService } from "@/services/aiService";
import { alertService } from "@/services/alertService";
import { emergencyService, sosService } from "@/services/emergencyService";
import { monitoringService, type BehaviourDataRequest } from "@/services/monitoringService";
import { locationService } from "@/services/locationService";
import { userService } from "@/services/userService";
import { currentUserId } from "@/services/session";
import type {
  AiAnalysisResult,
  EmergencyEvent,
  RiskAssessment,
  SafetyAlert,
  UserSettings,
} from "@/lib/types";

interface GuardianContextValue {
  monitoring: boolean;
  settings: UserSettings | null;
  latestRisk: RiskAssessment | null;
  pendingAlert: SafetyAlert | null;
  activeEmergency: EmergencyEvent | null;
  countdown: number;
  version: number;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  submitBehaviour: (sample: BehaviourDataRequest) => Promise<AiAnalysisResult>;
  respondSafe: () => Promise<void>;
  respondNeedHelp: () => Promise<void>;
  triggerSos: (simulated?: boolean) => Promise<void>;
  resolveEmergency: (id: string) => Promise<void>;
  cancelEmergency: (id: string) => Promise<void>;
  reload: () => Promise<void>;
  saveSettings: (patch: Partial<UserSettings>) => Promise<void>;
}

const GuardianContext = createContext<GuardianContextValue | null>(null);

export function GuardianProvider({ children }: { children: ReactNode }) {
  const [monitoring, setMonitoring] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [latestRisk, setLatestRisk] = useState<RiskAssessment | null>(null);
  const [pendingAlert, setPendingAlert] = useState<SafetyAlert | null>(null);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyEvent | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [version, setVersion] = useState(0);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const reload = useCallback(async () => {
    const [session, cfg, risk, alert, emergency] = await Promise.all([
      monitoringService.status(),
      userService.settings(),
      aiService.currentRisk(),
      alertService.pending(),
      emergencyService.active(),
    ]);
    setMonitoring(Boolean(session?.active));
    setSettings(cfg);
    setLatestRisk(risk);
    setPendingAlert(alert);
    setActiveEmergency(emergency);
    bump();
  }, [bump]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Alert countdown → automatic escalation on no response.
  useEffect(() => {
    if (!pendingAlert) {
      setCountdown(0);
      return;
    }
    setCountdown(settings?.alertTimeoutSeconds ?? 30);
    const id = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(id);
          void (async () => {
            const event = await alertService.respond(pendingAlert.id, "NO_RESPONSE");
            setPendingAlert(null);
            if (event) setActiveEmergency(event);
            toast.error("No response — emergency workflow started", {
              description: "Trusted contacts notified (simulated).",
            });
            bump();
          })();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [pendingAlert, settings?.alertTimeoutSeconds, bump]);

  const submitBehaviour = useCallback(
    async (sample: BehaviourDataRequest) => {
      await monitoringService.record(sample);
      const result = await aiService.analyze(
        {
          id: "tmp",
          userId: currentUserId(),
          activityType: sample.activityType,
          timestamp: sample.timestamp ?? new Date().toISOString(),
          latitude: sample.latitude,
          longitude: sample.longitude,
          movementDuration: sample.movementDuration,
          activityDuration: sample.activityDuration,
        },
        settings?.riskSensitivity ?? 1,
      );
      const { assessment, alert } = aiService.recordAssessment(result, sample.simulated);
      setLatestRisk(assessment);
      if (alert) setPendingAlert(alert);
      await locationService.record({
        latitude: sample.latitude,
        longitude: sample.longitude,
        accuracy: 15,
      });
      bump();
      return result;
    },
    [settings?.riskSensitivity, bump],
  );

  const value = useMemo<GuardianContextValue>(
    () => ({
      monitoring,
      settings,
      latestRisk,
      pendingAlert,
      activeEmergency,
      countdown,
      version,
      reload,
      submitBehaviour,
      startMonitoring: async () => {
        await monitoringService.start();
        setMonitoring(true);
        toast.success("Monitoring started", {
          description: "GuardianAI is watching your safety patterns.",
        });
        bump();
      },
      stopMonitoring: async () => {
        await monitoringService.stop();
        setMonitoring(false);
        toast("Monitoring stopped");
        bump();
      },
      respondSafe: async () => {
        if (!pendingAlert) return;
        await alertService.respond(pendingAlert.id, "SAFE");
        setPendingAlert(null);
        toast.success("Alert resolved", { description: "Monitoring continues." });
        bump();
      },
      respondNeedHelp: async () => {
        if (!pendingAlert) return;
        const event = await alertService.respond(pendingAlert.id, "NEED_HELP");
        setPendingAlert(null);
        if (event) setActiveEmergency(event);
        toast.error("Emergency workflow started");
        bump();
      },
      triggerSos: async (simulated = false) => {
        const event = await sosService.trigger(simulated);
        setActiveEmergency(event);
        toast.error(simulated ? "[DEMO] SOS triggered" : "SOS triggered", {
          description: "Trusted contacts notified in-app (simulated).",
        });
        bump();
      },
      resolveEmergency: async (id: string) => {
        await emergencyService.resolve(id);
        setActiveEmergency(null);
        toast.success("Emergency resolved");
        bump();
      },
      cancelEmergency: async (id: string) => {
        await emergencyService.cancel(id);
        setActiveEmergency(null);
        toast("Emergency cancelled");
        bump();
      },
      saveSettings: async (patch) => {
        const next = await userService.updateSettings(patch);
        setSettings({ ...next });
        bump();
      },
    }),
    [
      monitoring,
      settings,
      latestRisk,
      pendingAlert,
      activeEmergency,
      countdown,
      version,
      reload,
      submitBehaviour,
      bump,
    ],
  );

  return <GuardianContext.Provider value={value}>{children}</GuardianContext.Provider>;
}

export function useGuardian() {
  const ctx = useContext(GuardianContext);
  if (!ctx) throw new Error("useGuardian must be used inside GuardianProvider");
  return ctx;
}
