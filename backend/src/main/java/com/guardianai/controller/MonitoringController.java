package com.guardianai.controller;

import com.guardianai.dto.ApiResponse;
import com.guardianai.model.MonitoringSession;
import com.guardianai.model.User;
import com.guardianai.service.MonitoringService;
import com.guardianai.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/monitoring")
@RequiredArgsConstructor
public class MonitoringController {
    private final MonitoringService monitoringService;
    private final UserService userService;

    private String userId(Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        return user.getId();
    }

    @GetMapping("/status")
    public ApiResponse<MonitoringSession> status(Principal principal) {
        return ApiResponse.ok(monitoringService.status(userId(principal)));
    }

    @PostMapping("/start")
    public ApiResponse<MonitoringSession> start(Principal principal) {
        return ApiResponse.ok(monitoringService.start(userId(principal)));
    }

    @PostMapping("/stop")
    public ApiResponse<Map<String, Boolean>> stop(Principal principal) {
        monitoringService.stop(userId(principal));
        return ApiResponse.ok(Map.of("success", true));
    }
}