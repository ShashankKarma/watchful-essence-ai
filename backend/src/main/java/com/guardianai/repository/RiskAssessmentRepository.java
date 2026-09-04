package com.guardianai.repository;

import com.guardianai.model.RiskAssessment;
import com.guardianai.model.RiskLevel;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RiskAssessmentRepository extends MongoRepository<RiskAssessment, String> {
    List<RiskAssessment> findByUserIdOrderByTimestampDesc(String userId);
    Optional<RiskAssessment> findTopByUserIdOrderByTimestampDesc(String userId);
    List<RiskAssessment> findByUserIdAndRiskLevel(String userId, RiskLevel riskLevel);
}
