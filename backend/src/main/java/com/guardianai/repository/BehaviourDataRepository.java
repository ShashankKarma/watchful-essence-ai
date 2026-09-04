package com.guardianai.repository;

import com.guardianai.model.BehaviourData;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BehaviourDataRepository extends MongoRepository<BehaviourData, String> {
    List<BehaviourData> findByUserIdOrderByTimestampDesc(String userId);
    List<BehaviourData> findTop100ByUserIdOrderByTimestampDesc(String userId);
    List<BehaviourData> findByUserIdAndTimestampAfter(String userId, LocalDateTime after);
    long countByUserId(String userId);
}
