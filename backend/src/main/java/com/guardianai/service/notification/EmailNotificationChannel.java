package com.guardianai.service.notification;

import com.guardianai.model.Notification;
import com.guardianai.model.TrustedContact;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Stub email channel. No real email provider is integrated; delivery is only simulated via logs.
 */
@Slf4j
@Component
public class EmailNotificationChannel implements NotificationChannel {

    @Override
    public String getName() {
        return "EMAIL";
    }

    @Override
    public void send(Notification notification) {
        log.info("[simulated] Email would be sent to user {} - {}: {}", notification.getUserId(),
                notification.getTitle(), notification.getMessage());
    }

    @Override
    public void notifyContact(TrustedContact contact, String subject, String message) {
        log.info("[simulated] Email would be sent to {} ({}) - {}: {}", contact.getName(), contact.getEmail(), subject, message);
    }
}
