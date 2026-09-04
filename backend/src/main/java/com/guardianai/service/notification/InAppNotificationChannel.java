package com.guardianai.service.notification;

import com.guardianai.model.Notification;
import com.guardianai.model.TrustedContact;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class InAppNotificationChannel implements NotificationChannel {

    @Override
    public String getName() {
        return "IN_APP";
    }

    @Override
    public void send(Notification notification) {
        log.info("In-app notification delivered to user {}: {}", notification.getUserId(), notification.getTitle());
    }

    @Override
    public void notifyContact(TrustedContact contact, String subject, String message) {
        log.info("In-app notification delivered to trusted contact {}: {} - {}", contact.getName(), subject, message);
    }
}
