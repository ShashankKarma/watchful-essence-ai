package com.guardianai.service;

import com.guardianai.dto.NotificationResponse;
import com.guardianai.exception.ResourceNotFoundException;
import com.guardianai.model.Notification;
import com.guardianai.model.NotificationStatus;
import com.guardianai.model.NotificationType;
import com.guardianai.model.TrustedContact;
import com.guardianai.repository.NotificationRepository;
import com.guardianai.service.notification.InAppNotificationChannel;
import com.guardianai.service.notification.SmsNotificationChannel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final InAppNotificationChannel inAppNotificationChannel;
    private final SmsNotificationChannel smsNotificationChannel;

    public Notification create(String userId, String emergencyEventId, NotificationType type, String title, String message) {
        Notification notification = Notification.builder()
                .userId(userId)
                .emergencyEventId(emergencyEventId)
                .type(type)
                .title(title)
                .message(message)
                .status(NotificationStatus.UNREAD)
                .createdAt(LocalDateTime.now())
                .build();
        notification = notificationRepository.save(notification);
        inAppNotificationChannel.send(notification);
        return notification;
    }

    public ContactNotificationSummary notifyContacts(List<TrustedContact> contacts, String subject, String message) {
        return notifyContacts(contacts, subject, message, false);
    }

    public ContactNotificationSummary notifyContacts(List<TrustedContact> contacts, String subject, String message, boolean simulated) {
        List<TrustedContact> enabledContacts = contacts.stream()
                .filter(TrustedContact::isNotificationEnabled)
                .toList();
        if (simulated) {
            return new ContactNotificationSummary(0, 0, 0, enabledContacts.size(),
                    "Demo mode: no real SMS was sent.", List.of());
        }

        int accepted = 0;
        int failed = 0;
        int notConfigured = 0;
        int skipped = 0;
        List<String> outcomes = new ArrayList<>();
        for (TrustedContact contact : enabledContacts) {
            SmsNotificationChannel.DeliveryResult result =
                    smsNotificationChannel.sendToContact(contact, subject, message);
            outcomes.add(result.detail());
            switch (result.status()) {
                case "ACCEPTED" -> accepted++;
                case "FAILED" -> failed++;
                case "NOT_CONFIGURED" -> notConfigured++;
                default -> skipped++;
            }
        }

        String detail;
        if (enabledContacts.isEmpty()) {
            detail = "No trusted contacts have SMS alerts enabled.";
        } else if (accepted == enabledContacts.size()) {
            detail = "GatewayAPI accepted SMS requests for " + accepted + " of " + enabledContacts.size()
                    + " enabled contact(s); carrier delivery is not confirmed yet.";
        } else {
            detail = "SMS requests accepted for " + accepted + " of " + enabledContacts.size()
                    + " enabled contact(s); some could not be sent. Check the contact phone, Java server credentials, and GatewayAPI delivery logs.";
        }
        return new ContactNotificationSummary(accepted, failed, notConfigured, skipped, detail, outcomes);
    }

    public record ContactNotificationSummary(int accepted, int failed, int notConfigured, int skipped,
                                              String detail, List<String> outcomes) { }

    public List<NotificationResponse> list(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public NotificationResponse markRead(String userId, String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found");
        }
        notification.setStatus(NotificationStatus.READ);
        return toResponse(notificationRepository.save(notification));
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .status(notification.getStatus())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
