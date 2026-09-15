package com.guardianai.controller;

import com.guardianai.dto.ApiResponse;
import com.guardianai.dto.NotificationResponse;
import com.guardianai.model.User;
import com.guardianai.service.NotificationService;
import com.guardianai.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    private final UserService userService;

    private String userId(Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        return user.getId();
    }

    @GetMapping
    public ApiResponse<List<NotificationResponse>> list(Principal principal) {
        return ApiResponse.ok(notificationService.list(userId(principal)));
    }

    @PostMapping("/{id}/read")
    public ApiResponse<NotificationResponse> markRead(Principal principal, @PathVariable String id) {
        return ApiResponse.ok(notificationService.markRead(userId(principal), id));
    }

    @PostMapping("/read-all")
    public ApiResponse<Map<String, Boolean>> markAllRead(Principal principal) {
        notificationService.list(userId(principal)).forEach(notification ->
                notificationService.markRead(userId(principal), notification.getId()));
        return ApiResponse.ok(Map.of("success", true));
    }
}