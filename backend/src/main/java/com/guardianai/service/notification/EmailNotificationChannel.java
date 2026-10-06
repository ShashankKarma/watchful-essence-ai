package com.guardianai.service.notification;

import com.guardianai.model.Notification;
import com.guardianai.model.TrustedContact;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class EmailNotificationChannel implements NotificationChannel {

    private static final String RESEND_EMAILS_URL = "https://api.resend.com/emails";

    private final WebClient.Builder webClientBuilder;
    private final String apiKey;
    private final String fromEmail;

    public EmailNotificationChannel(WebClient.Builder webClientBuilder,
                                    @Value("${resend.api-key:}") String apiKey,
                                    @Value("${resend.from-email:}") String fromEmail) {
        this.webClientBuilder = webClientBuilder;
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
    }

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
        sendEmail(contact, subject, message, "<p>" + escapeHtml(message) + "</p>");
    }

    public DeliveryResult sendEmergencyAlert(TrustedContact contact, String triggerType, String riskLevel,
                                             String emergencyMessage, Double latitude, Double longitude) {
        if (contact.getEmail() == null || contact.getEmail().isBlank()) {
            return new DeliveryResult("SKIPPED", "Email not sent to " + contact.getName() + ": no email address is saved.");
        }

        String subject = "GuardianAI emergency alert";
        StringBuilder text = new StringBuilder()
                .append("GuardianAI emergency alert\n\n")
                .append("Trigger type: ").append(triggerType).append('\n')
                .append("Risk level: ").append(riskLevel).append('\n')
                .append("Emergency message: ").append(emergencyMessage);
        StringBuilder html = new StringBuilder("<h2>GuardianAI emergency alert</h2><ul>")
                .append("<li><strong>Trigger type:</strong> ").append(escapeHtml(triggerType)).append("</li>")
                .append("<li><strong>Risk level:</strong> ").append(escapeHtml(riskLevel)).append("</li>")
                .append("<li><strong>Emergency message:</strong> ").append(escapeHtml(emergencyMessage)).append("</li>");

        if (latitude != null && longitude != null) {
            String coordinates = latitude + ", " + longitude;
            String mapUrl = "https://www.google.com/maps?q=" + latitude + "," + longitude;
            text.append("\nLocation: ").append(coordinates).append("\nMap: ").append(mapUrl);
            html.append("<li><strong>Location:</strong> ").append(escapeHtml(coordinates)).append("</li>")
                    .append("</ul><p><a href=\"").append(mapUrl)
                    .append("\">Open location in Google Maps</a></p>");
        } else {
            html.append("</ul>");
        }

        return sendEmail(contact, subject, text.toString(), html.toString());
    }

    private DeliveryResult sendEmail(TrustedContact contact, String subject, String text, String html) {
        if (contact.getEmail() == null || contact.getEmail().isBlank()) {
            return new DeliveryResult("SKIPPED", "Email not sent to " + contact.getName() + ": no email address is saved.");
        }
        if (apiKey.isBlank() || fromEmail.isBlank()) {
            log.warn("Email not sent to trusted contact {} because Resend credentials or sender are not configured", contact.getName());
            return new DeliveryResult("NOT_CONFIGURED", "Email not sent to " + contact.getName()
                    + ": Resend API key or verified sender address is not configured on the Java server.");
        }

        try {
            webClientBuilder.build()
                    .post()
                    .uri(RESEND_EMAILS_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + apiKey)
                    .bodyValue(Map.of(
                            "from", fromEmail,
                            "to", List.of(contact.getEmail()),
                            "subject", subject,
                            "text", text,
                            "html", html
                    ))
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("Resend accepted emergency email for trusted contact {}", contact.getName());
            return new DeliveryResult("ACCEPTED", "Resend accepted the email request for " + contact.getName()
                    + "; recipient delivery is not confirmed yet.");
        } catch (WebClientResponseException exception) {
            log.error("Resend email request failed for trusted contact {} [HTTP {}]", contact.getName(),
                    exception.getStatusCode().value());
            return new DeliveryResult("FAILED", "Email request failed for " + contact.getName()
                    + " (provider HTTP " + exception.getStatusCode().value() + "). Check the Java server log for details.");
        } catch (RuntimeException exception) {
            log.error("Resend email request failed for trusted contact {}: {}", contact.getName(), exception.getMessage());
            return new DeliveryResult("FAILED", "Email request failed for " + contact.getName()
                    + ". Check the Java server log for details.");
        }
    }

    private String escapeHtml(String value) {
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    public record DeliveryResult(String status, String detail) { }
}
