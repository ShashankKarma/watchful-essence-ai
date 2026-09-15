package com.guardianai.controller;

import com.guardianai.dto.AdminDashboardResponse;
import com.guardianai.dto.ApiResponse;
import com.guardianai.dto.EmergencyResponse;
import com.guardianai.dto.UserResponse;
import com.guardianai.model.EmergencyEvent;
import com.guardianai.service.AdminService;
import com.guardianai.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ApiResponse<AdminDashboardResponse> dashboard() {
        return ApiResponse.ok(adminService.dashboard());
    }

    @GetMapping("/users")
    public ApiResponse<List<UserResponse>> users() {
        return ApiResponse.ok(adminService.users().stream().map(AuthService::toUserResponse).toList());
    }

    @GetMapping("/emergencies")
    public ApiResponse<List<EmergencyEvent>> emergencies() {
        return ApiResponse.ok(adminService.emergencies());
    }

    @GetMapping("/analytics")
    public ApiResponse<Map<String, Object>> analytics() {
        return ApiResponse.ok(adminService.analytics());
    }
}