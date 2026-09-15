package com.guardianai.controller;

import com.guardianai.dto.ApiResponse;
import com.guardianai.dto.ChangePasswordRequest;
import com.guardianai.dto.ProfileUpdateRequest;
import com.guardianai.dto.SettingsRequest;
import com.guardianai.dto.UserResponse;
import com.guardianai.model.User;
import com.guardianai.model.UserSettings;
import com.guardianai.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ProfileController {
    private final UserService userService;

    @GetMapping("/api/profile")
    public ApiResponse<UserResponse> profile(Principal principal) {
        return ApiResponse.ok(userService.getProfile(principal.getName()));
    }

    @PutMapping("/api/profile")
    public ApiResponse<UserResponse> updateProfile(Principal principal,
                                                    @RequestBody ProfileUpdateRequest request) {
        return ApiResponse.ok(userService.updateProfile(principal.getName(), request));
    }

    @PostMapping("/api/profile/password")
    public ApiResponse<MapResponse> changePassword(Principal principal,
                                                    @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(principal.getName(), request);
        return ApiResponse.ok(new MapResponse(true));
    }

    @GetMapping("/api/settings")
    public ApiResponse<UserSettings> settings(Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        return ApiResponse.ok(userService.getSettings(user.getId()));
    }

    @PutMapping("/api/settings")
    public ApiResponse<UserSettings> updateSettings(Principal principal,
                                                      @RequestBody SettingsRequest request) {
        User user = userService.getUserByEmail(principal.getName());
        return ApiResponse.ok(userService.updateSettings(user.getId(), request));
    }

    public record MapResponse(boolean success) { }
}