import type { BehaviourData, DigitalTwin, AiAnalysisResult, RiskLevel } from "./types";

/**
 * Deterministic statistical anomaly engine — mirrors the Spring Boot
 * AnomalyDetectionEngine. No randomness: every score derives from the
 * user's stored Digital Twin baseline.
 */

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function riskLevelFor(score: number): RiskLevel {
  if (score <= 30) return "LOW";
  if (score <= 60) return "MEDIUM";
  if (score <= 80) return "HIGH";
  return "CRITICAL";
}

export function analyseBehaviour(
  behaviour: BehaviourData,
  twin: DigitalTwin,
  sensitivity = 1,
): AiAnalysisResult {
  const reasons: string[] = [];
  const hour = new Date(behaviour.timestamp).getHours();

  // 1. Time-of-day deviation (weight 30)
  let hourScore = 0;
  if (!twin.baselineActiveHours.includes(hour)) {
    const distance = Math.min(
      ...twin.baselineActiveHours.map((h) => {
        const d = Math.abs(h - hour);
        return Math.min(d, 24 - d);
      }),
    );
    hourScore = Math.min(30, distance * 8);
    reasons.push(
      `Activity at ${String(hour).padStart(2, "0")}:00 falls outside your normal active hours`,
    );
  }

  // 2. Distance from usual locations (weight 30)
  let locationScore = 0;
  if (twin.usualLocations.length > 0) {
    const nearest = Math.min(
      ...twin.usualLocations.map((p) =>
        haversineKm(behaviour.latitude, behaviour.longitude, p.latitude, p.longitude),
      ),
    );
    if (nearest > 1.5) {
      locationScore = Math.min(30, (nearest - 1.5) * 6);
      reasons.push(`Unusual location — ${nearest.toFixed(1)} km from your familiar places`);
    }
  }

  // 3. Movement duration deviation (weight 25)
  let movementScore = 0;
  const baseline = Math.max(1, twin.baselineMovementDuration);
  const deviation = Math.abs(behaviour.movementDuration - baseline) / baseline;
  if (deviation > 0.5) {
    movementScore = Math.min(25, (deviation - 0.5) * 25);
    reasons.push(
      behaviour.movementDuration > baseline
        ? "Movement duration much longer than your baseline"
        : "Movement stopped far earlier than your baseline",
    );
  }

  // 4. Activity rarity (weight 15)
  let activityScore = 0;
  const freq = twin.baselineActivityFrequency ?? {};
  const total = Object.values(freq).reduce((a, b) => a + b, 0) || 1;
  const share = (freq[behaviour.activityType] ?? 0) / total;
  if (share < 0.1) {
    activityScore = Math.min(15, (0.1 - share) * 150);
    reasons.push(`"${behaviour.activityType}" is rare in your behavioural baseline`);
  }

  const raw = (hourScore + locationScore + movementScore + activityScore) * sensitivity;
  const anomalyScore = Math.max(0, Math.min(100, Math.round(raw)));
  const confidence = Math.round(
    Math.min(0.95, 0.45 + (twin.learningProgress / 100) * 0.5) * 100,
  ) / 100;

  if (reasons.length === 0) reasons.push("Behaviour matches your normal pattern");

  return {
    anomalyScore,
    riskLevel: riskLevelFor(anomalyScore),
    confidence,
    reasons,
    source: "LOCAL",
  };
}
