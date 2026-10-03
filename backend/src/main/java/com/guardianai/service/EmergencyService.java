package com.guardianai.service;

import com.guardianai.dto.EmergencyResponse;
import com.guardianai.dto.SosRequest;
import com.guardianai.exception.BadRequestException;
import com.guardianai.exception.ResourceNotFoundException;
import com.guardianai.model.EmergencyEvent;
import com.guardianai.model.EmergencyStatus;
import com.guardianai.model.LocationData;
import com.guardianai.model.NotificationType;
import com.guardianai.model.RiskLevel;
import com.guardianai.model.SafetyAlert;
import com.guardianai.model.TimelineEntry;
import com.guardianai.model.TriggerType;
import com.guardianai.model.TrustedContact;
import com.guardianai.repository.EmergencyEventRepository;
import com.guardianai.repository.LocationDataRepository;
import com.guardianai.repository.TrustedContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmergencyService {

    private final EmergencyEventRepository emergencyEventRepository;
    private final LocationDataRepository locationDataRepository;
    private final TrustedContactRepository trustedContactRepository;
    private final NotificationService notificationService;

    public EmergencyResponse sos(String userId, SosRequest request) {
        LocationData location = null;
        if (request.getLatitude() != null && request.getLongitude() != null) {
            location = locationDataRepository.save(LocationData.builder()
                    .userId(userId)
                    .latitude(request.getLatitude())
                    .longitude(request.getLongitude())
                    .accuracy(0)
                    .timestamp(LocalDateTime.now())
                    .build());
        }

        List<TimelineEntry> timeline = new ArrayList<>();
        timeline.add(entry("Detection", "User manually triggered an SOS."));
        timeline.add(entry("Emergency Trigger", "Emergency event created with MANUAL_SOS trigger."));
        if (request.getMessage() != null && !request.getMessage().isBlank()) {
            timeline.add(entry("User Response", request.getMessage()));
        }

        return createAndNotify(userId, TriggerType.MANUAL_SOS, RiskLevel.CRITICAL,
                location != null ? location.getId() : null, timeline, false);
    }

    public EmergencyResponse triggerFromAlert(SafetyAlert alert) {
        LocationData location = locationDataRepository.findTopByUserIdOrderByTimestampDesc(alert.getUserId()).orElse(null);

        List<TimelineEntry> timeline = new ArrayList<>();
        timeline.add(entry("Detection", "AI anomaly detection flagged risk level " + alert.getRiskLevel() + "."));
        timeline.add(entry("Alert", "Safety alert " + alert.getId() + " was raised and sent to the user."));
        timeline.add(entry("User Response", "User responded NEED_HELP to the safety alert."));
        timeline.add(entry("Emergency Trigger", "Emergency event created with AI_DETECTION trigger."));

        return createAndNotify(alert.getUserId(), TriggerType.AI_DETECTION, alert.getRiskLevel(),
                location != null ? location.getId() : null, timeline, alert.isSimulated());
    }

    public EmergencyResponse triggerAutoEscalation(SafetyAlert alert) {
        LocationData location = locationDataRepository.findTopByUserIdOrderByTimestampDesc(alert.getUserId()).orElse(null);

        List<TimelineEntry> timeline = new ArrayList<>();
        timeline.add(entry("Detection", "AI anomaly detection flagged risk level " + alert.getRiskLevel() + "."));
        timeline.add(entry("Alert", "Safety alert " + alert.getId() + " was raised and sent to the user."));
        timeline.add(entry("User Response", "No response received from user within the configured timeout."));
        timeline.add(entry("Emergency Trigger", "Emergency event auto-escalated with AUTO_ESCALATION trigger."));

        return createAndNotify(alert.getUserId(), TriggerType.AUTO_ESCALATION, alert.getRiskLevel(),
                location != null ? location.getId() : null, timeline, alert.isSimulated());
    }

    private EmergencyResponse createAndNotify(String userId, TriggerType triggerType, RiskLevel riskLevel,
                                               String locationId, List<TimelineEntry> timeline, boolean simulated) {
        List<TrustedContact> contacts = trustedContactRepository.findByUserIdOrderByPriorityAsc(userId);
        List<String> contactIds = contacts.stream()
                .filter(TrustedContact::isNotificationEnabled)
                .map(TrustedContact::getId)
                .toList();

        EmergencyEvent event = EmergencyEvent.builder()
                .userId(userId)
                .triggerType(triggerType)
                .riskLevel(riskLevel)
                .locationId(locationId)
                .status(EmergencyStatus.ACTIVE)
                .notifiedContactIds(contactIds)
                .timeline(timeline)
                .simulated(simulated)
                .timestamp(LocalDateTime.now())
                .build();
        event = emergencyEventRepository.save(event);

        notificationService.create(userId, event.getId(), NotificationType.EMERGENCY,
                "Emergency alert triggered", "An emergency event has been created and your trusted contacts are being notified.");
        NotificationService.ContactNotificationSummary notificationSummary = notificationService.notifyContacts(contacts, "GuardianAI emergency alert",
                "Your trusted contact may need help. Trigger: " + triggerType + ", risk level: " + riskLevel
                        + ". Please contact them and local emergency services if needed.", simulated);

        event.getTimeline().add(entry("Contact Notification", notificationSummary.detail()));
        for (String outcome : notificationSummary.outcomes()) {
            event.getTimeline().add(entry("SMS Result", outcome));
        }
        event = emergencyEventRepository.save(event);

        return toResponse(event);
    }

    public List<EmergencyResponse> history(String userId) {
        return emergencyEventRepository.findByUserIdOrderByTimestampDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public EmergencyResponse getById(String userId, String id) {
        EmergencyEvent event = getOwnedEvent(userId, id);
        return toResponse(event);
    }

    public EmergencyResponse resolve(String userId, String id) {
        EmergencyEvent event = getOwnedEvent(userId, id);
        if (event.getStatus() != EmergencyStatus.ACTIVE) {
            throw new BadRequestException("Only active emergency events can be resolved");
        }
        event.setStatus(EmergencyStatus.RESOLVED);
        event.getTimeline().add(entry("Resolution", "Emergency event resolved by the user."));
        return toResponse(emergencyEventRepository.save(event));
    }

    public EmergencyResponse cancel(String userId, String id) {
        EmergencyEvent event = getOwnedEvent(userId, id);
        if (event.getStatus() != EmergencyStatus.ACTIVE) {
            throw new BadRequestException("Only active emergency events can be cancelled");
        }
        event.setStatus(EmergencyStatus.CANCELLED);
        event.getTimeline().add(entry("Resolution", "Emergency event cancelled by the user."));
        return toResponse(emergencyEventRepository.save(event));
    }

    private EmergencyEvent getOwnedEvent(String userId, String id) {
        EmergencyEvent event = emergencyEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency event not found"));
        if (!event.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Emergency event not found");
        }
        return event;
    }

    private TimelineEntry entry(String stage, String detail) {
        return TimelineEntry.builder().stage(stage).detail(detail).at(LocalDateTime.now()).build();
    }

    private EmergencyResponse toResponse(EmergencyEvent event) {
        return EmergencyResponse.builder()
                .id(event.getId())
                .userId(event.getUserId())
                .triggerType(event.getTriggerType())
                .riskLevel(event.getRiskLevel())
                .status(event.getStatus())
                .notifiedContactIds(event.getNotifiedContactIds())
                .timeline(event.getTimeline())
                .simulated(event.isSimulated())
                .timestamp(event.getTimestamp())
                .build();
    }
}
