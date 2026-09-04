import { apiClient, call } from "./apiClient";
import { db, save, uid } from "@/lib/demoStore";
import { currentUserId } from "./session";
import { analyseBehaviour } from "@/lib/anomaly";
import type {
  AiAnalysisResult,
  BehaviourData,
  DigitalTwin,
  RiskAssessment,
  SafetyAlert,
} from "@/lib/types";

function twinFor(userId: string): DigitalTwin {
  const data = db();
  let twin = data.twins.find((t) => t.userId === userId);
  if (!twin) {
    twin = {
      id: uid(),
      userId,
      baselineActiveHours: [],
      baselineMovementDuration: 0,
      baselineActivityFrequency: {},
      usualLocations: [],
      riskThreshold: 61,
      learningProgress: 0,
      lastUpdated: new Date().toISOString(),
    };
    data.twins.push(twin);
    save();
  }
  return twin;
}

export const aiService = {
  digitalTwin(): Promise<DigitalTwin> {
    return call(
      () => apiClient.get("/api/digital-twin"),
      () => twinFor(currentUserId()),
    );
  },

  /** Recomputes the behavioural baseline from stored behaviour history. */
  rebuildTwin(): Promise<DigitalTwin> {
    return call(
      () => apiClient.get("/api/behaviour/baseline"),
      () => {
        const userId = currentUserId();
        const data = db();
        const twin = twinFor(userId);
        const history = data.behaviour.filter((b) => b.userId === userId && !b.simulated);
        if (history.length) {
          const hours = new Set<number>();
          const freq: Record<string, number> = {};
          let movement = 0;
          history.forEach((b) => {
            hours.add(new Date(b.timestamp).getHours());
            freq[b.activityType] = (freq[b.activityType] ?? 0) + 1;
            movement += b.movementDuration;
          });
          twin.baselineActiveHours = [...hours].sort((a, b) => a - b);
          twin.baselineActivityFrequency = freq;
          twin.baselineMovementDuration = Math.round(movement / history.length);
          twin.learningProgress = Math.min(100, history.length * 2);
          twin.lastUpdated = new Date().toISOString();
        }
        save();
        return twin;
      },
    );
  },

  analyze(behaviour: BehaviourData, sensitivity = 1): Promise<AiAnalysisResult> {
    return call(
      () => apiClient.post("/api/ai/analyze", behaviour),
      () => analyseBehaviour(behaviour, twinFor(behaviour.userId), sensitivity),
    );
  },

  riskHistory(): Promise<RiskAssessment[]> {
    return call(
      () => apiClient.get("/api/ai/risk-history"),
      () =>
        db()
          .risks.filter((r) => r.userId === currentUserId())
          .sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    );
  },

  currentRisk(): Promise<RiskAssessment | null> {
    return call(
      () => apiClient.get("/api/ai/risk-score"),
      () => {
        const mine = db()
          .risks.filter((r) => r.userId === currentUserId())
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        return mine[0] ?? null;
      },
    );
  },

  /** Persists an assessment locally and raises a safety alert on HIGH/CRITICAL. */
  recordAssessment(result: AiAnalysisResult, simulated = false): {
    assessment: RiskAssessment;
    alert: SafetyAlert | null;
  } {
    const data = db();
    const userId = currentUserId();
    const assessment: RiskAssessment = {
      id: uid(),
      userId,
      anomalyScore: result.anomalyScore,
      riskLevel: result.riskLevel,
      reasons: result.reasons,
      confidence: result.confidence,
      source: result.source,
      timestamp: new Date().toISOString(),
      simulated,
    };
    data.risks.push(assessment);

    let alert: SafetyAlert | null = null;
    if (result.riskLevel === "HIGH" || result.riskLevel === "CRITICAL") {
      alert = {
        id: uid(),
        userId,
        riskAssessmentId: assessment.id,
        riskScore: result.anomalyScore,
        riskLevel: result.riskLevel,
        reasons: result.reasons,
        response: "PENDING",
        status: "OPEN",
        createdAt: new Date().toISOString(),
        simulated,
      };
      data.alerts.push(alert);
      data.notifications.unshift({
        id: uid(),
        userId,
        type: "HIGH_RISK",
        title: `${simulated ? "[DEMO] " : ""}Unusual activity detected`,
        message: `GuardianAI detected behaviour that differs from your normal pattern (score ${result.anomalyScore}).`,
        status: "UNREAD",
        createdAt: new Date().toISOString(),
      });
    }
    save();
    return { assessment, alert };
  },
};
