package com.guardianai.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "behaviour_data")
public class BehaviourData {
    @Id
    private String id;
    private String userId;
    private ActivityType activityType;
    private LocalDateTime timestamp;
    private double latitude;
    private double longitude;
    private double movementDuration;
    private double activityDuration;
    private Map<String, Object> metadata;
}
