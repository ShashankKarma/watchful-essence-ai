package com.guardianai.service.notification;

import com.guardianai.model.Notification;
import com.guardianai.model.TrustedContact;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Stub SMS channel. No real SMS provider is integrated; delivery is only simulated via logs.
 */
@Slf4j
@Component
public class SmsNotificationChannel implements NotificationChannel {

    @Override
    public String getName() {
        return "SMS";
    }

    @Override
    public void send(Notification notification) {
        log.info("[simulated] SMS would be sent to user {} - {}: {}", notification.getUserId(),
                notification.getTitle(), notification.getMessage());
    }

    @Override
    public void notifyContact(TrustedContact contact, String subject, String message) {
        log.info("[simulated] SMS would be sent to {} ({}) - {}: {}", contact.getName(), contact.getPhone(), subject, message);
    }
}
