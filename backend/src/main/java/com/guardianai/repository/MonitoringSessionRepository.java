package com.guardianai.repository;

import com.guardianai.model.MonitoringSession;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MonitoringSessionRepository extends MongoRepository<MonitoringSession, String> {
    List<MonitoringSession> findByUserIdOrderByStartedAtDesc(String userId);
    Optional<MonitoringSession> findByUserIdAndActiveTrue(String userId);
}
