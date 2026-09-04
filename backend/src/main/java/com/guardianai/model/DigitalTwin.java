package com.guardianai.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "digital_twins")
public class DigitalTwin {
    @Id
    private String id;
    private String userId;
    private List<Integer> baselineActiveHours;
    private double baselineMovementDuration;
    private Map<String, Integer> baselineActivityFrequency;
    private List<GeoPoint> usualLocations;
    private double riskThreshold;
    private double learningProgress;
    private LocalDateTime lastUpdated;
}
