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
@Document(collection = "risk_assessments")
public class RiskAssessment {
    @Id
    private String id;
    private String userId;
    private double anomalyScore;
    private RiskLevel riskLevel;
    private List<String> reasons;
    private double confidence;
    private RiskSource source;
    private LocalDateTime timestamp;
}
