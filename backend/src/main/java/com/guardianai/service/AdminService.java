package com.guardianai.service;

import com.guardianai.dto.AdminDashboardResponse;
import com.guardianai.model.AlertStatus;
import com.guardianai.model.EmergencyEvent;
import com.guardianai.model.EmergencyStatus;
import com.guardianai.model.Role;
import com.guardianai.model.User;
import com.guardianai.repository.EmergencyEventRepository;
import com.guardianai.repository.MonitoringSessionRepository;
import com.guardianai.repository.SafetyAlertRepository;
import com.guardianai.repository.TrustedContactRepository;
import com.guardianai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TrustedContactRepository trustedContactRepository;
    private final EmergencyEventRepository emergencyEventRepository;
    private final SafetyAlertRepository safetyAlertRepository;
    private final MonitoringSessionRepository monitoringSessionRepository;

    public AdminDashboardResponse dashboard() {
        long monitoringUsers = userRepository.findByRole(Role.USER).stream()
                .filter(User::isMonitoringEnabled).count();
        return AdminDashboardResponse.builder()
                .totalUsers(userRepository.count())
                .totalTrustedContacts(trustedContactRepository.count())
                .activeEmergencies(emergencyEventRepository.countByStatus(EmergencyStatus.ACTIVE))
                .totalEmergencies(emergencyEventRepository.count())
                .totalAlerts(safetyAlertRepository.count())
                .openAlerts(safetyAlertRepository.findByStatus(AlertStatus.OPEN).size())
                .monitoringUsers(monitoringUsers)
                .build();
    }

    public List<User> users() {
        return userRepository.findAll();
    }

    public List<EmergencyEvent> emergencies() {
        return emergencyEventRepository.findAll();
    }

    public Map<String, Object> analytics() {
        return Map.of(
                "usersByRole", Map.of(
                        "USER", userRepository.countByRole(Role.USER),
                        "TRUSTED_CONTACT", userRepository.countByRole(Role.TRUSTED_CONTACT),
                        "ADMIN", userRepository.countByRole(Role.ADMIN)),
                "emergenciesByStatus", Map.of(
                        "ACTIVE", emergencyEventRepository.countByStatus(EmergencyStatus.ACTIVE),
                        "RESOLVED", emergencyEventRepository.countByStatus(EmergencyStatus.RESOLVED),
                        "CANCELLED", emergencyEventRepository.countByStatus(EmergencyStatus.CANCELLED),
                        "AUTO_ESCALATED", emergencyEventRepository.countByStatus(EmergencyStatus.AUTO_ESCALATED)),
                "totalAlerts", safetyAlertRepository.count(),
                "activeMonitoringSessions", monitoringSessionRepository.findAll().stream().filter(m -> m.isActive()).count()
        );
    }
}
