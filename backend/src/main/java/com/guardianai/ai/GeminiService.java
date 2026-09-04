package com.guardianai.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class GeminiService {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String model;

    @Value("${gemini.base-url:https://generativelanguage.googleapis.com}")
    private String baseUrl;

    public GeminiService(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    /**
     * Attempts to get a natural-language risk explanation from Gemini. Fully fault-tolerant:
     * returns Optional.empty() on missing key, network error, timeout, or parse failure.
     */
    public Optional<String> explainRisk(String activityType, double anomalyScore, String riskLevel,
                                         java.util.List<String> reasons) {
        if (apiKey == null || apiKey.isBlank()) {
            return Optional.empty();
        }

        try {
            String prompt = String.format(
                    "You are a safety assistant. A user's behaviour anomaly detection produced: "
                            + "activityType=%s, anomalyScore=%.1f/100, riskLevel=%s, reasons=%s. "
                            + "In 1-2 short sentences, explain this risk to the user in plain, reassuring but clear language.",
                    activityType, anomalyScore, riskLevel, reasons
            );

            Map<String, Object> body = Map.of(
                    "contents", new Object[]{
                            Map.of("parts", new Object[]{Map.of("text", prompt)})
                    }
            );

            String uri = String.format("/v1beta/models/%s:generateContent?key=%s", model, apiKey);

            String response = webClientBuilder.build()
                    .post()
                    .uri(baseUrl + uri)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(6))
                    .block();

            if (response == null) {
                return Optional.empty();
            }

            JsonNode root = objectMapper.readTree(response);
            JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (textNode.isMissingNode() || textNode.asText().isBlank()) {
                return Optional.empty();
            }
            return Optional.of(textNode.asText().trim());
        } catch (Exception e) {
            log.warn("Gemini call failed, falling back to local explanation only: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
