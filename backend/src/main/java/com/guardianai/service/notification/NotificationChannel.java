package com.guardianai.service.notification;

import com.guardianai.model.Notification;
import com.guardianai.model.TrustedContact;

public interface NotificationChannel {

    String getName();

    void send(Notification notification);

    void notifyContact(TrustedContact contact, String subject, String message);
}
