package com.guardianai.repository;

import com.guardianai.model.EmergencyEvent;
import com.guardianai.model.EmergencyStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface EmergencyEventRepository extends MongoRepository<EmergencyEvent, String> {
    List<EmergencyEvent> findByUserIdOrderByTimestampDesc(String userId);
    List<EmergencyEvent> findByStatus(EmergencyStatus status);
    List<EmergencyEvent> findByUserIdAndStatus(String userId, EmergencyStatus status);
    long countByStatus(EmergencyStatus status);
    long countByUserId(String userId);
}
