package com.guardianai.service;

import com.guardianai.dto.LoginRequest;
import com.guardianai.dto.LoginResponse;
import com.guardianai.dto.RegisterRequest;
import com.guardianai.dto.UserResponse;
import com.guardianai.exception.BadRequestException;
import com.guardianai.exception.ResourceNotFoundException;
import com.guardianai.model.Role;
import com.guardianai.model.User;
import com.guardianai.model.UserSettings;
import com.guardianai.repository.UserRepository;
import com.guardianai.repository.UserSettingsRepository;
import com.guardianai.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .emergencyPin(request.getEmergencyPin())
                .monitoringEnabled(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        user = userRepository.save(user);

        UserSettings settings = UserSettings.builder()
                .userId(user.getId())
                .riskSensitivity(60)
                .alertTimeoutSeconds(30)
                .locationSharing(true)
                .monitoringEnabled(false)
                .notificationPreferences(Map.of("inApp", true, "sms", false, "email", false))
                .privacyLevel("STANDARD")
                .build();
        userSettingsRepository.save(settings);

        String token = jwtService.generateToken(toUserDetails(user));
        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(toUserResponse(user))
                .build();
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtService.generateToken(toUserDetails(user));
        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(toUserResponse(user))
                .build();
    }

    public UserResponse me(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toUserResponse(user);
    }

    public String forgotPassword(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        // In a demo system we do not send real emails; we simulate the flow.
        return "If an account exists for this email, password reset instructions have been simulated.";
    }

    private UserDetails toUserDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();
    }

    public static UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .monitoringEnabled(user.isMonitoringEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
