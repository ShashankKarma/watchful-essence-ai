package com.guardianai.service;

import com.guardianai.model.*;
import com.guardianai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DemoService {

    private final BehaviourDataRepository behaviourDataRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final SafetyAlertRepository safetyAlertRepository;
    private final EmergencyEventRepository emergencyEventRepository;
    private final LocationDataRepository locationDataRepository;
    private final NotificationRepository notificationRepository;
    private final TrustedContactRepository trustedContactRepository;

    /**
     * Runs a 12-step simulated demo scenario for the given user, all data marked simulated=true.
     */
    public Map<String, Object> simulate(String userId) {
        List<String> steps = new ArrayList<>();

        steps.add("1. Monitoring session started (simulated).");
        LocationData loc = locationDataRepository.save(LocationData.builder()
                .userId(userId).latitude(28.6139).longitude(77.2090).accuracy(5).timestamp(LocalDateTime.now()).build());
        steps.add("2. Baseline location captured.");

        BehaviourData normal = behaviourDataRepository.save(BehaviourData.builder()
                .userId(userId).activityType(ActivityType.WALKING).timestamp(LocalDateTime.now())
                .latitude(28.6139).longitude(77.2090).movementDuration(10).activityDuration(10)
                .metadata(Map.of("simulated", true)).build());
        steps.add("3. Normal walking behaviour recorded.");

        steps.add("4. Digital twin baseline consulted.");

        BehaviourData anomalous = behaviourDataRepository.save(BehaviourData.builder()
                .userId(userId).activityType(ActivityType.STATIONARY).timestamp(LocalDateTime.now().withHour(2))
                .latitude(28.7).longitude(77.4).movementDuration(60).activityDuration(60)
                .metadata(Map.of("simulated", true)).build());
        steps.add("5. Anomalous late-night behaviour recorded far from usual locations.");

        RiskAssessment assessment = riskAssessmentRepository.save(RiskAssessment.builder()
                .userId(userId).anomalyScore(85).riskLevel(RiskLevel.CRITICAL)
                .reasons(List.of("Activity at unusual hour", "Far from usual locations"))
                .confidence(0.8).source(RiskSource.LOCAL).timestamp(LocalDateTime.now()).build());
        steps.add("6. AI anomaly detection produced CRITICAL risk assessment.");

        SafetyAlert alert = safetyAlertRepository.save(SafetyAlert.builder()
                .userId(userId).riskAssessmentId(assessment.getId()).riskScore(85).riskLevel(RiskLevel.CRITICAL)
                .reasons(assessment.getReasons()).response(AlertResponse.PENDING).status(AlertStatus.OPEN)
                .createdAt(LocalDateTime.now()).simulated(true).build());
        steps.add("7. Safety alert raised to user.");

        notificationRepository.save(Notification.builder()
                .userId(userId).type(NotificationType.HIGH_RISK).title("Unusual activity detected")
                .message("Simulated high-risk alert").status(NotificationStatus.UNREAD).createdAt(LocalDateTime.now()).build());
        steps.add("8. In-app notification delivered.");

        alert.setResponse(AlertResponse.NO_RESPONSE);
        alert.setStatus(AlertStatus.ESCALATED);
        alert.setRespondedAt(LocalDateTime.now());
        safetyAlertRepository.save(alert);
        steps.add("9. No response received; alert auto-escalated.");

        List<TrustedContact> contacts = trustedContactRepository.findByUserIdOrderByPriorityAsc(userId);
        List<TimelineEntry> timeline = List.of(
                TimelineEntry.builder().stage("Detection").detail("Simulated anomaly detected").at(LocalDateTime.now()).build(),
                TimelineEntry.builder().stage("Alert").detail("Simulated safety alert raised").at(LocalDateTime.now()).build(),
                TimelineEntry.builder().stage("User Response").detail("No response (simulated)").at(LocalDateTime.now()).build(),
                TimelineEntry.builder().stage("Emergency Trigger").detail("Emergency event auto-escalated").at(LocalDateTime.now()).build(),
                TimelineEntry.builder().stage("Contact Notification").detail("Notified " + contacts.size() + " trusted contact(s)").at(LocalDateTime.now()).build(),
                TimelineEntry.builder().stage("Resolution").detail("Resolved by demo simulation").at(LocalDateTime.now()).build()
        );
        EmergencyEvent event = emergencyEventRepository.save(EmergencyEvent.builder()
                .userId(userId).triggerType(TriggerType.AUTO_ESCALATION).riskLevel(RiskLevel.CRITICAL)
                .locationId(loc.getId()).status(EmergencyStatus.RESOLVED)
                .notifiedContactIds(contacts.stream().map(TrustedContact::getId).toList())
                .timeline(new ArrayList<>(timeline)).simulated(true).timestamp(LocalDateTime.now()).build());
        steps.add("10. Emergency event created and trusted contacts notified (simulated).");
        steps.add("11. Emergency event resolved.");
        steps.add("12. Demo sequence completed.");

        return Map.of("steps", steps, "emergencyEventId", event.getId(), "alertId", alert.getId());
    }
}
