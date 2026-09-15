package com.guardianai.controller;

import com.guardianai.dto.ApiResponse;
import com.guardianai.model.SafetyTip;
import com.guardianai.service.SafetyTipService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/safety-tips")
@RequiredArgsConstructor
public class SafetyTipController {
    private final SafetyTipService safetyTipService;

    @GetMapping
    public ApiResponse<List<SafetyTip>> list(@RequestParam(required = false) String category) {
        return ApiResponse.ok(safetyTipService.list(category));
    }
}