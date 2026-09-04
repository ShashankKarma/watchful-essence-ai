package com.guardianai.service;

import com.guardianai.ai.AnomalyDetectionEngine;
import com.guardianai.ai.DigitalTwinService;
import com.guardianai.ai.GeminiService;
import com.guardianai.dto.AiAnalysisRequest;
import com.guardianai.dto.AiAnalysisResponse;
import com.guardianai.dto.RiskAssessmentResponse;
import com.guardianai.model.DigitalTwin;
import com.guardianai.model.RiskAssessment;
import com.guardianai.model.RiskLevel;
import com.guardianai.model.RiskSource;
import com.guardianai.model.SafetyAlert;
import com.guardianai.repository.RiskAssessmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AiAnalysisService {

    private final AnomalyDetectionEngine anomalyDetectionEngine;
    private final DigitalTwinService digitalTwinService;
    private final GeminiService geminiService;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final AlertService alertService;

    public AiAnalysisResponse analyze(String userId, AiAnalysisRequest request) {
        DigitalTwin twin = digitalTwinService.getOrCreateTwin(userId);

        AnomalyDetectionEngine.Result result = anomalyDetectionEngine.evaluate(
                twin,
                request.getActivityType(),
                request.getLatitude(),
                request.getLongitude(),
                request.getMovementDuration(),
                LocalDateTime.now());

        String geminiExplanation = null;
        RiskSource source = RiskSource.LOCAL;
        if (request.isUseGemini()) {
            Optional<String> explanation = geminiService.explainRisk(
                    request.getActivityType().name(), result.anomalyScore, result.riskLevel.name(), result.reasons);
            if (explanation.isPresent()) {
                geminiExplanation = explanation.get();
                source = RiskSource.GEMINI;
            }
        }

        RiskAssessment assessment = RiskAssessment.builder()
                .userId(userId)
                .anomalyScore(result.anomalyScore)
                .riskLevel(result.riskLevel)
                .reasons(result.reasons)
                .confidence(result.confidence)
                .source(source)
                .timestamp(LocalDateTime.now())
                .build();
        assessment = riskAssessmentRepository.save(assessment);

        boolean alertCreated = false;
        String alertId = null;
        if (result.riskLevel == RiskLevel.HIGH || result.riskLevel == RiskLevel.CRITICAL) {
            SafetyAlert alert = alertService.createAlertFromAssessment(assessment);
            alertCreated = true;
            alertId = alert.getId();
        }

        return AiAnalysisResponse.builder()
                .anomalyScore(result.anomalyScore)
                .riskLevel(result.riskLevel)
                .confidence(result.confidence)
                .reasons(result.reasons)
                .geminiExplanation(geminiExplanation)
                .alertCreated(alertCreated)
                .alertId(alertId)
                .build();
    }

    public RiskAssessmentResponse latestRiskScore(String userId) {
        RiskAssessment assessment = riskAssessmentRepository.findTopByUserIdOrderByTimestampDesc(userId)
                .orElse(RiskAssessment.builder()
                        .anomalyScore(0)
                        .riskLevel(RiskLevel.LOW)
                        .reasons(List.of("No behaviour data recorded yet"))
                        .confidence(0)
                        .source(RiskSource.LOCAL)
                        .timestamp(LocalDateTime.now())
                        .build());
        return toResponse(assessment);
    }

    public List<RiskAssessmentResponse> riskHistory(String userId) {
        return riskAssessmentRepository.findByUserIdOrderByTimestampDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    private RiskAssessmentResponse toResponse(RiskAssessment a) {
        return RiskAssessmentResponse.builder()
                .id(a.getId())
                .anomalyScore(a.getAnomalyScore())
                .riskLevel(a.getRiskLevel())
                .reasons(a.getReasons())
                .confidence(a.getConfidence())
                .source(a.getSource())
                .timestamp(a.getTimestamp())
                .build();
    }
}
