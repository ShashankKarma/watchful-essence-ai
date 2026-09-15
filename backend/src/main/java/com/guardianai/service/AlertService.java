package com.guardianai.service;

import com.guardianai.exception.ResourceNotFoundException;
import com.guardianai.model.AlertResponse;
import com.guardianai.model.AlertStatus;
import com.guardianai.model.NotificationType;
import com.guardianai.model.RiskAssessment;
import com.guardianai.model.SafetyAlert;
import com.guardianai.model.TriggerType;
import com.guardianai.repository.SafetyAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final SafetyAlertRepository safetyAlertRepository;
    private final NotificationService notificationService;
    private final EmergencyService emergencyService;

    @Value("${app.alert-timeout-seconds:30}")
    private long alertTimeoutSeconds;

    public SafetyAlert createAlertFromAssessment(RiskAssessment assessment) {
        SafetyAlert alert = SafetyAlert.builder()
                .userId(assessment.getUserId())
                .riskAssessmentId(assessment.getId())
                .riskScore(assessment.getAnomalyScore())
                .riskLevel(assessment.getRiskLevel())
                .reasons(assessment.getReasons())
                .response(AlertResponse.PENDING)
                .status(AlertStatus.OPEN)
                .createdAt(LocalDateTime.now())
                .simulated(false)
                .build();
        alert = safetyAlertRepository.save(alert);

        notificationService.create(assessment.getUserId(), null, NotificationType.HIGH_RISK,
                "Unusual activity detected",
                "We noticed unusual behaviour (" + assessment.getRiskLevel() + "). Please confirm you are safe.");

        return alert;
    }

    public List<SafetyAlert> list(String userId) {
        return safetyAlertRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public SafetyAlert respond(String userId, String alertId, AlertResponse response) {
        SafetyAlert alert = safetyAlertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));
        if (!alert.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Alert not found");
        }

        alert.setResponse(response);
        alert.setRespondedAt(LocalDateTime.now());
        alert.setStatus(response == AlertResponse.SAFE ? AlertStatus.RESOLVED : AlertStatus.ESCALATED);
        alert = safetyAlertRepository.save(alert);

        if (response == AlertResponse.NEED_HELP) {
            emergencyService.triggerFromAlert(alert);
        }

        return alert;
    }

    /**
     * Sweeps open alerts that are still pending a response past the configurable timeout and
     * escalates them into an emergency event automatically.
     */
    @Scheduled(fixedDelay = 15000)
    public void sweepPendingAlerts() {
        List<SafetyAlert> openAlerts = safetyAlertRepository.findByStatus(AlertStatus.OPEN);
        for (SafetyAlert alert : openAlerts) {
            if (alert.getResponse() != AlertResponse.PENDING) {
                continue;
            }
            long secondsElapsed = java.time.Duration.between(alert.getCreatedAt(), LocalDateTime.now()).getSeconds();
            if (secondsElapsed >= alertTimeoutSeconds) {
                alert.setStatus(AlertStatus.ESCALATED);
                alert.setResponse(AlertResponse.NO_RESPONSE);
                alert.setRespondedAt(LocalDateTime.now());
                safetyAlertRepository.save(alert);
                log.warn("Alert {} auto-escalated after {}s of no response", alert.getId(), secondsElapsed);
                emergencyService.triggerAutoEscalation(alert);
            }
        }
    }
}
