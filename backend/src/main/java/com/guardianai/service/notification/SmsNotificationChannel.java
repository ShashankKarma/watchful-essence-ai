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
    private final String directToken;
    private final String directUrl;
    private final String defaultCountryCode;
    private final String sender;

    public SmsNotificationChannel(
            WebClient.Builder webClientBuilder,
            @Value("${messaging.gateway-url:https://connector-gateway.lovable.dev/gatewayapi}") String gatewayUrl,
            @Value("${LOVABLE_API_KEY:}") String lovableApiKey,
            @Value("${GATEWAYAPI_API_KEY:}") String gatewayApiKey,
            @Value("${GATEWAYAPI_TOKEN:}") String directToken,
            @Value("${messaging.direct-url:https://messaging.gatewayapi.com}") String directUrl,
            @Value("${messaging.default-country-code:91}") String defaultCountryCode,
            @Value("${messaging.sms-sender:GuardianAI}") String sender) {
        this.webClientBuilder = webClientBuilder;
        this.gatewayUrl = gatewayUrl;
        this.lovableApiKey = lovableApiKey;
        this.gatewayApiKey = gatewayApiKey;
        this.directToken = directToken;
        this.directUrl = directUrl;
        this.defaultCountryCode = defaultCountryCode;
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
        boolean direct = !directToken.isBlank();
        boolean viaGateway = !lovableApiKey.isBlank() && !gatewayApiKey.isBlank();
        if (!direct && !viaGateway) {
            log.warn("SMS simulated for {} because messaging credentials are not configured", contact.getPhone());
            return;
        }

        try {
            WebClient.RequestBodySpec request = webClientBuilder.build()
                    .post()
                    .uri((direct ? directUrl : gatewayUrl) + "/mobile/single");
            if (direct) {
                request = request.header("Authorization", "Token " + directToken);
            } else {
                request = request.header("Authorization", "Bearer " + lovableApiKey)
                        .header("X-Connection-Api-Key", gatewayApiKey);
            }
            String response = request
                    .bodyValue(Map.of(
                            "sender", sender,
                            "recipient", normalizeRecipient(contact.getPhone()),
                            "message", subject + ": " + message
                    ))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            log.info("SMS sent to trusted contact {} ({}): {}", contact.getName(), contact.getPhone(), response);
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException exception) {
            log.error("SMS delivery failed for trusted contact {} ({}) [{}]: {}",
                    contact.getName(), contact.getPhone(), exception.getStatusCode(),
                    exception.getResponseBodyAsString());
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
        if (digits.startsWith("0")) {
            digits = digits.replaceFirst("^0+", "");
        }
        if (digits.length() == 10 && !defaultCountryCode.isBlank()) {
            digits = defaultCountryCode + digits;
        }
        return Long.parseLong(digits);
    }
}
