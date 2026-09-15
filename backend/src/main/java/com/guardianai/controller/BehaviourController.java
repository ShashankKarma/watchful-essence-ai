package com.guardianai.controller;

import com.guardianai.dto.ApiResponse;
import com.guardianai.dto.BehaviourDataRequest;
import com.guardianai.model.BehaviourData;
import com.guardianai.model.DigitalTwin;
import com.guardianai.model.User;
import com.guardianai.service.BehaviourService;
import com.guardianai.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/behaviour")
@RequiredArgsConstructor
public class BehaviourController {
    private final BehaviourService behaviourService;
    private final UserService userService;

    private String userId(Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        return user.getId();
    }

    @GetMapping
    public ApiResponse<List<BehaviourData>> history(Principal principal) {
        return ApiResponse.ok(behaviourService.history(userId(principal)));
    }

    @PostMapping
    public ApiResponse<BehaviourData> record(Principal principal,
                                              @Valid @RequestBody BehaviourDataRequest request) {
        return ApiResponse.ok(behaviourService.record(userId(principal), request));
    }

    @GetMapping("/baseline")
    public ApiResponse<DigitalTwin> baseline(Principal principal) {
        return ApiResponse.ok(behaviourService.baseline(userId(principal)));
    }
}