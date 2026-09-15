package com.guardianai.dto;

import com.guardianai.model.ActivityType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiAnalysisRequest {
    @NotNull
    private ActivityType activityType;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private double movementDuration;
    private boolean useGemini = true;
}
