package com.guardianai.controller;

import com.guardianai.dto.AlertResponseRequest;
import com.guardianai.dto.ApiResponse;
import com.guardianai.model.SafetyAlert;
import com.guardianai.model.User;
import com.guardianai.service.AlertService;
import com.guardianai.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {
    private final AlertService alertService;
    private final UserService userService;

    private String userId(Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        return user.getId();
    }

    @GetMapping
    public ApiResponse<List<SafetyAlert>> list(Principal principal) {
        return ApiResponse.ok(alertService.list(userId(principal)));
    }

    @PostMapping("/{id}/respond")
    public ApiResponse<SafetyAlert> respond(Principal principal, @PathVariable String id,
                                             @Valid @RequestBody AlertResponseRequest request) {
        return ApiResponse.ok(alertService.respond(userId(principal), id, request.getResponse()));
    }
}