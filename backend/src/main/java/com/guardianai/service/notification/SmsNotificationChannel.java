package com.guardianai.service.notification;

import com.guardianai.model.Notification;
import com.guardianai.model.TrustedContact;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Slf4j
@Component
public class SmsNotificationChannel implements NotificationChannel {

    private final WebClient.Builder webClientBuilder;
    private final String gatewayUrl;
    private final String lovableApiKey;
    private final String gatewayApiKey;
    private final String sender;

    public SmsNotificationChannel(
            WebClient.Builder webClientBuilder,
            @Value("${messaging.gateway-url:https://connector-gateway.lovable.dev/gatewayapi}") String gatewayUrl,
            @Value("${LOVABLE_API_KEY:}") String lovableApiKey,
            @Value("${GATEWAYAPI_API_KEY:}") String gatewayApiKey,
            @Value("${messaging.sms-sender:GuardianAI}") String sender) {
        this.webClientBuilder = webClientBuilder;
        this.gatewayUrl = gatewayUrl;
        this.lovableApiKey = lovableApiKey;
        this.gatewayApiKey = gatewayApiKey;
        this.sender = sender;
    }

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
        if (contact.getPhone() == null || contact.getPhone().isBlank()) {
            log.warn("SMS skipped for trusted contact {} because no phone number is configured", contact.getName());
            return;
        }
        if (lovableApiKey.isBlank() || gatewayApiKey.isBlank()) {
            log.warn("SMS simulated for {} because messaging credentials are not configured", contact.getPhone());
            return;
        }

        try {
            webClientBuilder.build()
                    .post()
                    .uri(gatewayUrl + "/mobile/single")
                    .header("Authorization", "Bearer " + lovableApiKey)
                    .header("X-Connection-Api-Key", gatewayApiKey)
                    .bodyValue(Map.of(
                            "sender", sender,
                            "recipient", normalizeRecipient(contact.getPhone()),
                            "message", subject + ": " + message
                    ))
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("SMS sent to trusted contact {} ({})", contact.getName(), contact.getPhone());
        } catch (RuntimeException exception) {
            log.error("SMS delivery failed for trusted contact {} ({}): {}",
                    contact.getName(), contact.getPhone(), exception.getMessage());
        }
    }

    private long normalizeRecipient(String phone) {
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.isBlank()) {
            throw new IllegalArgumentException("Trusted contact phone number has no digits");
        }
        return Long.parseLong(digits);
    }
}
