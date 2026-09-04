package com.guardianai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalUsers;
    private long totalTrustedContacts;
    private long activeEmergencies;
    private long totalEmergencies;
    private long totalAlerts;
    private long openAlerts;
    private long monitoringUsers;
}
