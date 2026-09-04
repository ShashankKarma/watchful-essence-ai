package com.guardianai.repository;

import com.guardianai.model.AlertStatus;
import com.guardianai.model.SafetyAlert;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SafetyAlertRepository extends MongoRepository<SafetyAlert, String> {
    List<SafetyAlert> findByUserIdOrderByCreatedAtDesc(String userId);
    List<SafetyAlert> findByUserIdAndStatus(String userId, AlertStatus status);
    List<SafetyAlert> findByStatus(AlertStatus status);
    long countByUserIdAndStatus(String userId, AlertStatus status);
}
