package com.guardianai.repository;

import com.guardianai.model.TrustedContact;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TrustedContactRepository extends MongoRepository<TrustedContact, String> {
    List<TrustedContact> findByUserId(String userId);
    List<TrustedContact> findByUserIdOrderByPriorityAsc(String userId);
    void deleteByUserId(String userId);
}
