package com.guardianai.controller;

import com.guardianai.service.PersistenceVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final PersistenceVerificationService persistenceVerificationService;

    @GetMapping("/persistence")
    public ResponseEntity<PersistenceHealthResponse> verifyPersistence() {
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