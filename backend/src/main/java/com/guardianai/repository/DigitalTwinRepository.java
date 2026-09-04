package com.guardianai.repository;

import com.guardianai.model.DigitalTwin;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface DigitalTwinRepository extends MongoRepository<DigitalTwin, String> {
    Optional<DigitalTwin> findByUserId(String userId);
}
