package com.guardianai.controller;

import com.guardianai.dto.AiAnalysisRequest;
import com.guardianai.dto.AiAnalysisResponse;
import com.guardianai.dto.ApiResponse;
import com.guardianai.dto.RiskAssessmentResponse;
import com.guardianai.model.User;
import com.guardianai.service.AiAnalysisService;
import com.guardianai.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {
    private final AiAnalysisService aiAnalysisService;
    private final UserService userService;

    private String userId(Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        return user.getId();
    }

    @PostMapping("/analyze")
    public ApiResponse<AiAnalysisResponse> analyze(Principal principal,
                                                    @Valid @RequestBody AiAnalysisRequest request) {
        return ApiResponse.ok(aiAnalysisService.analyze(userId(principal), request));
    }

    @GetMapping("/risk-score")
    public ApiResponse<RiskAssessmentResponse> riskScore(Principal principal) {
        return ApiResponse.ok(aiAnalysisService.latestRiskScore(userId(principal)));
    }

    @GetMapping("/risk-history")
    public ApiResponse<List<RiskAssessmentResponse>> riskHistory(Principal principal) {
        return ApiResponse.ok(aiAnalysisService.riskHistory(userId(principal)));
    }
}