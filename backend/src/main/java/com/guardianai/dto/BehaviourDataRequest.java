package com.guardianai.dto;

import com.guardianai.model.ActivityType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;

@Data
public class BehaviourDataRequest {
    @NotNull
    private ActivityType activityType;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private double movementDuration;
    private double activityDuration;
    private Map<String, Object> metadata;
}
