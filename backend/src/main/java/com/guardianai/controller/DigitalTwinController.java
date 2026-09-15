package com.guardianai.controller;

import com.guardianai.dto.ApiResponse;
import com.guardianai.model.DigitalTwin;
import com.guardianai.model.User;
import com.guardianai.service.BehaviourService;
import com.guardianai.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/digital-twin")
@RequiredArgsConstructor
public class DigitalTwinController {
    private final BehaviourService behaviourService;
    private final UserService userService;

    @GetMapping
    public ApiResponse<DigitalTwin> get(Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        return ApiResponse.ok(behaviourService.baseline(user.getId()));
    }
}