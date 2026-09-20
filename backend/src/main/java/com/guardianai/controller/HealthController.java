package com.guardianai.controller;

import com.guardianai.service.PersistenceVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final PersistenceVerificationService persistenceVerificationService;

    @Value("${app.health-check-token:}")
    private String healthCheckToken;

    @GetMapping("/persistence")
    public ResponseEntity<PersistenceHealthResponse> verifyPersistence(
            @org.springframework.web.bind.annotation.RequestHeader(value = "X-Health-Check-Token", required = false) String providedToken) {
        if (healthCheckToken.isBlank() || providedToken == null || !MessageDigest.isEqual(
                healthCheckToken.getBytes(StandardCharsets.UTF_8),
                providedToken.getBytes(StandardCharsets.UTF_8))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        PersistenceVerificationService.VerificationResult result = persistenceVerificationService.verify();
        PersistenceHealthResponse response = new PersistenceHealthResponse(
                result.databaseReachable() && result.writeReadVerified() ? "UP" : "DOWN",
                result.databaseReachable(),
                result.writeReadVerified(),
                result.message(),
                Instant.now());
        return ResponseEntity.status(response.status().equals("UP") ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
                .body(response);
    }

    public record PersistenceHealthResponse(
            String status,
            boolean databaseReachable,
            boolean writeReadVerified,
            String message,
            Instant checkedAt) {
    }
}