package com.guardianai.dto;

import com.guardianai.model.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisResponse {
    private double anomalyScore;
    private RiskLevel riskLevel;
    private double confidence;
    private List<String> reasons;
    private String geminiExplanation;
    private boolean alertCreated;
    private String alertId;
}
