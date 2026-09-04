package com.guardianai.service;

import com.guardianai.model.SafetyTip;
import com.guardianai.repository.SafetyTipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SafetyTipService {

    private final SafetyTipRepository safetyTipRepository;

    public List<SafetyTip> list(String category) {
        if (category != null && !category.isBlank()) {
            return safetyTipRepository.findByCategory(category);
        }
        return safetyTipRepository.findAll();
    }
}
