package com.guardianai.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_settings")
public class UserSettings {
    @Id
    private String id;
    private String userId;
    private double riskSensitivity;
    private int alertTimeoutSeconds;
    private boolean locationSharing;
    private boolean monitoringEnabled;
    private Map<String, Boolean> notificationPreferences;
    private String privacyLevel;
}
