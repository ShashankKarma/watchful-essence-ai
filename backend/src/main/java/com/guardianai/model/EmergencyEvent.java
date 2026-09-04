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
@Document(collection = "emergency_events")
public class EmergencyEvent {
    @Id
    private String id;
    private String userId;
    private TriggerType triggerType;
    private RiskLevel riskLevel;
    private String locationId;
    private EmergencyStatus status;
    private List<String> notifiedContactIds;
    private List<TimelineEntry> timeline;
    private boolean simulated;
    private LocalDateTime timestamp;
}
