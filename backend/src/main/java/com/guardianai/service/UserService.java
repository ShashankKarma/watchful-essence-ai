package com.guardianai.service;

import com.guardianai.dto.ChangePasswordRequest;
import com.guardianai.dto.ProfileUpdateRequest;
import com.guardianai.dto.SettingsRequest;
import com.guardianai.dto.UserResponse;
import com.guardianai.exception.BadRequestException;
import com.guardianai.exception.ResourceNotFoundException;
import com.guardianai.model.User;
import com.guardianai.model.UserSettings;
import com.guardianai.repository.UserRepository;
import com.guardianai.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final PasswordEncoder passwordEncoder;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserResponse getProfile(String email) {
        return AuthService.toUserResponse(getUserByEmail(email));
    }

    public UserResponse updateProfile(String email, ProfileUpdateRequest request) {
        User user = getUserByEmail(email);
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone());
        }
        if (request.getEmergencyPin() != null && !request.getEmergencyPin().isBlank()) {
            user.setEmergencyPin(request.getEmergencyPin());
        }
        user.setUpdatedAt(LocalDateTime.now());
        return AuthService.toUserResponse(userRepository.save(user));
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getUserByEmail(email);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public UserSettings getSettings(String userId) {
        return userSettingsRepository.findByUserId(userId).orElseGet(() -> {
            UserSettings settings = UserSettings.builder()
                    .userId(userId)
                    .riskSensitivity(60)
                    .alertTimeoutSeconds(30)
                    .locationSharing(true)
                    .monitoringEnabled(false)
                    .notificationPreferences(new HashMap<>(Map.of("inApp", true, "sms", false, "email", false)))
                    .privacyLevel("STANDARD")
                    .build();
            return userSettingsRepository.save(settings);
        });
    }

    public UserSettings updateSettings(String userId, SettingsRequest request) {
        UserSettings settings = getSettings(userId);
        if (request.getRiskSensitivity() != null) {
            settings.setRiskSensitivity(request.getRiskSensitivity());
        }
        if (request.getAlertTimeoutSeconds() != null) {
            settings.setAlertTimeoutSeconds(request.getAlertTimeoutSeconds());
        }
        if (request.getLocationSharing() != null) {
            settings.setLocationSharing(request.getLocationSharing());
        }
        if (request.getMonitoringEnabled() != null) {
            settings.setMonitoringEnabled(request.getMonitoringEnabled());
            User user = getUserById(userId);
            user.setMonitoringEnabled(request.getMonitoringEnabled());
            userRepository.save(user);
        }
        if (request.getNotificationPreferences() != null) {
            settings.setNotificationPreferences(request.getNotificationPreferences());
        }
        if (request.getPrivacyLevel() != null) {
            settings.setPrivacyLevel(request.getPrivacyLevel());
        }
        return userSettingsRepository.save(settings);
    }
}
