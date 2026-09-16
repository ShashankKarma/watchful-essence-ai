package com.guardianai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

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
    private long activeMonitoringSessions;
    private long alertsToday;
    private long highRiskEvents;
    private long emergencyEvents;
    private List<RiskDistribution> riskDistribution;
    private List<TrendPoint> alertsOverTime;
    private List<MonitoringPoint> monitoringActivity;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskDistribution {
        private String level;
        private long count;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendPoint {
        private String date;
        private long alerts;
        private long emergencies;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonitoringPoint {
        private String date;
        private long sessions;
    }
}
