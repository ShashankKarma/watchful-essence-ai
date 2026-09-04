package com.guardianai.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "safety_alerts")
public class SafetyAlert {
    @Id
    private String id;
    private String userId;
    private String riskAssessmentId;
    private double riskScore;
    private RiskLevel riskLevel;
    private List<String> reasons;
    private AlertResponse response;
    private AlertStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
    private boolean simulated;
}
