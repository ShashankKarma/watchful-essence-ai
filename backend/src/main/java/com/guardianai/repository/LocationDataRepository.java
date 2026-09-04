package com.guardianai.repository;

import com.guardianai.model.LocationData;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface LocationDataRepository extends MongoRepository<LocationData, String> {
    List<LocationData> findByUserIdOrderByTimestampDesc(String userId);
    Optional<LocationData> findTopByUserIdOrderByTimestampDesc(String userId);
}
