package com.guardianai.dto;

import com.guardianai.model.RiskLevel;
import com.guardianai.model.RiskSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAssessmentResponse {
    private String id;
    private double anomalyScore;
    private RiskLevel riskLevel;
    private List<String> reasons;
    private double confidence;
    private RiskSource source;
    private LocalDateTime timestamp;
}
