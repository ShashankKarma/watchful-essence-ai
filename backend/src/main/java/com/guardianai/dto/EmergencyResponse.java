package com.guardianai.dto;

import com.guardianai.model.EmergencyStatus;
import com.guardianai.model.RiskLevel;
import com.guardianai.model.TimelineEntry;
import com.guardianai.model.TriggerType;
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
public class EmergencyResponse {
    private String id;
    private String userId;
    private TriggerType triggerType;
    private RiskLevel riskLevel;
    private EmergencyStatus status;
    private List<String> notifiedContactIds;
    private List<TimelineEntry> timeline;
    private boolean simulated;
    private LocalDateTime timestamp;
}
