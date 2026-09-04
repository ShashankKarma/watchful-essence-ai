package com.guardianai.repository;

import com.guardianai.model.Notification;
import com.guardianai.model.NotificationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndStatus(String userId, NotificationStatus status);
    long countByUserIdAndStatus(String userId, NotificationStatus status);
}
