package com.guardianai.controller;

import com.guardianai.dto.ApiResponse;
import com.guardianai.dto.LocationRequest;
import com.guardianai.model.LocationData;
import com.guardianai.model.User;
import com.guardianai.service.LocationService;
import com.guardianai.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
public class LocationController {
    private final LocationService locationService;
    private final UserService userService;

    private String userId(Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        return user.getId();
    }

    @PostMapping
    public ApiResponse<LocationData> record(Principal principal, @Valid @RequestBody LocationRequest request) {
        return ApiResponse.ok(locationService.record(userId(principal), request));
    }

    @GetMapping("/current")
    public ApiResponse<LocationData> current(Principal principal) {
        return ApiResponse.ok(locationService.current(userId(principal)));
    }

    @GetMapping("/history")
    public ApiResponse<List<LocationData>> history(Principal principal) {
        return ApiResponse.ok(locationService.history(userId(principal)));
    }
}