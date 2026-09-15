package com.guardianai.controller;

import com.guardianai.dto.ApiResponse;
import com.guardianai.dto.EmergencyResponse;
import com.guardianai.dto.SosRequest;
import com.guardianai.model.User;
import com.guardianai.service.EmergencyService;
import com.guardianai.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class EmergencyController {
    private final EmergencyService emergencyService;
    private final UserService userService;

    private String userId(Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        return user.getId();
    }

    @PostMapping("/api/sos")
    public ApiResponse<EmergencyResponse> sos(Principal principal, @Valid @RequestBody SosRequest request) {
        return ApiResponse.ok(emergencyService.sos(userId(principal), request));
    }

    @GetMapping("/api/emergency/history")
    public ApiResponse<List<EmergencyResponse>> history(Principal principal) {
        return ApiResponse.ok(emergencyService.history(userId(principal)));
    }

    @GetMapping("/api/emergency/{id}")
    public ApiResponse<EmergencyResponse> get(Principal principal, @PathVariable String id) {
        return ApiResponse.ok(emergencyService.getById(userId(principal), id));
    }

    @PostMapping("/api/emergency/{id}/resolve")
    public ApiResponse<EmergencyResponse> resolve(Principal principal, @PathVariable String id) {
        return ApiResponse.ok(emergencyService.resolve(userId(principal), id));
    }

    @PostMapping("/api/emergency/{id}/cancel")
    public ApiResponse<EmergencyResponse> cancel(Principal principal, @PathVariable String id) {
        return ApiResponse.ok(emergencyService.cancel(userId(principal), id));
    }
}