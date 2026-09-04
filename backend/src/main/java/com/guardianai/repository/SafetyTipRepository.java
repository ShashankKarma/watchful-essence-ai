package com.guardianai.repository;

import com.guardianai.model.SafetyTip;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SafetyTipRepository extends MongoRepository<SafetyTip, String> {
    List<SafetyTip> findByCategory(String category);
}
