package com.guardianai.ai;

import com.guardianai.model.ActivityType;
import com.guardianai.model.DigitalTwin;
import com.guardianai.model.GeoPoint;
import com.guardianai.model.RiskLevel;
import com.guardianai.util.GeoUtils;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class AnomalyDetectionEngine {

    public static class Result {
        public double anomalyScore;
        public RiskLevel riskLevel;
        public double confidence;
        public List<String> reasons;
    }

    public Result evaluate(DigitalTwin twin, ActivityType activityType, double lat, double lng,
                            double movementDuration, LocalDateTime timestamp) {
        List<String> reasons = new ArrayList<>();
        double score = 0;

        int hour = timestamp.getHour();
        List<Integer> baselineHours = twin.getBaselineActiveHours();
        boolean hourMatches = baselineHours != null && baselineHours.contains(hour);
        if (!hourMatches) {
            score += 25;
            reasons.add("Activity at unusual hour (" + hour + ":00) outside typical active hours");
        }

        double minDistance = Double.MAX_VALUE;
        List<GeoPoint> usual = twin.getUsualLocations();
        if (usual != null && !usual.isEmpty()) {
            for (GeoPoint p : usual) {
                double d = GeoUtils.haversineKm(lat, lng, p.getLat(), p.getLng());
                minDistance = Math.min(minDistance, d);
            }
        } else {
            minDistance = 0;
        }
        if (minDistance > 5) {
            score += 30;
            reasons.add(String.format("Location is %.1f km from any usual location", minDistance));
        } else if (minDistance > 1.5) {
            score += 12;
            reasons.add(String.format("Location is %.1f km from usual locations (moderate deviation)", minDistance));
        }

        double baselineDuration = twin.getBaselineMovementDuration();
        if (baselineDuration > 0) {
            double deviation = Math.abs(movementDuration - baselineDuration) / baselineDuration;
            if (deviation > 1.5) {
                score += 25;
                reasons.add("Movement duration deviates significantly from baseline");
            } else if (deviation > 0.7) {
                score += 12;
                reasons.add("Movement duration moderately deviates from baseline");
            }
        }

        Map<String, Integer> freq = twin.getBaselineActivityFrequency();
        if (freq != null && !freq.isEmpty()) {
            int total = freq.values().stream().mapToInt(Integer::intValue).sum();
            int count = freq.getOrDefault(activityType.name(), 0);
            double ratio = total == 0 ? 0 : (double) count / total;
            if (ratio < 0.05) {
                score += 20;
                reasons.add("Activity type '" + activityType + "' is rare for this user");
            }
        }

        score = Math.min(100, Math.max(0, score));

        RiskLevel level;
        if (score <= 30) {
            level = RiskLevel.LOW;
        } else if (score <= 60) {
            level = RiskLevel.MEDIUM;
        } else if (score <= 80) {
            level = RiskLevel.HIGH;
        } else {
            level = RiskLevel.CRITICAL;
        }

        if (reasons.isEmpty()) {
            reasons.add("Behaviour consistent with established baseline");
        }

        double confidence = Math.min(1.0, Math.max(0.1, twin.getLearningProgress() / 100.0));

        Result result = new Result();
        result.anomalyScore = score;
        result.riskLevel = level;
        result.confidence = confidence;
        result.reasons = reasons;
        return result;
    }
}
