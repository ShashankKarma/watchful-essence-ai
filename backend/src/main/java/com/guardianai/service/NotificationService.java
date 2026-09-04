package com.guardianai.service;

import com.guardianai.dto.NotificationResponse;
import com.guardianai.exception.ResourceNotFoundException;
import com.guardianai.model.Notification;
import com.guardianai.model.NotificationStatus;
import com.guardianai.model.NotificationType;
import com.guardianai.model.TrustedContact;
import com.guardianai.repository.NotificationRepository;
import com.guardianai.service.notification.EmailNotificationChannel;
import com.guardianai.service.notification.InAppNotificationChannel;
import com.guardianai.service.notification.NotificationChannel;
import com.guardianai.service.notification.SmsNotificationChannel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final InAppNotificationChannel inAppNotificationChannel;
    private final SmsNotificationChannel smsNotificationChannel;
    private final EmailNotificationChannel emailNotificationChannel;

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

    public void notifyContacts(List<TrustedContact> contacts, String subject, String message) {
        for (TrustedContact contact : contacts) {
            if (!contact.isNotificationEnabled()) {
                continue;
            }
            List<NotificationChannel> channels = List.of(smsNotificationChannel, emailNotificationChannel);
            for (NotificationChannel channel : channels) {
                channel.notifyContact(contact, subject, message);
            }
        }
    }

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
