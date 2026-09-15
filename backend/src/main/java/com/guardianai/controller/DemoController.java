package com.guardianai.controller;

import com.guardianai.dto.ApiResponse;
import com.guardianai.model.User;
import com.guardianai.service.DemoService;
import com.guardianai.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
public class DemoController {
    private final DemoService demoService;
    private final UserService userService;

    @PostMapping("/simulate")
    public ApiResponse<Map<String, Object>> simulate(Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        return ApiResponse.ok(demoService.simulate(user.getId()));
    }
}