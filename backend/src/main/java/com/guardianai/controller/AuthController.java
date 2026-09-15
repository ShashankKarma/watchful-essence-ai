package com.guardianai.controller;

import com.guardianai.dto.ApiResponse;
import com.guardianai.dto.LoginRequest;
import com.guardianai.dto.LoginResponse;
import com.guardianai.dto.RegisterRequest;
import com.guardianai.dto.UserResponse;
import com.guardianai.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> me(Principal principal) {
        return ApiResponse.ok(authService.me(principal.getName()));
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        return ApiResponse.ok(Map.of("message", authService.forgotPassword(request.getOrDefault("email", ""))));
    }
}