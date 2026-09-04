package com.guardianai.dto;

import lombok.Data;

import java.util.Map;

@Data
public class SettingsRequest {
    private Double riskSensitivity;
    private Integer alertTimeoutSeconds;
    private Boolean locationSharing;
    private Boolean monitoringEnabled;
    private Map<String, Boolean> notificationPreferences;
    private String privacyLevel;
}
