package com.guardianai.service;

import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PersistenceVerificationService {

    private static final String VERIFICATION_COLLECTION = "persistence_verification";

    private final MongoTemplate mongoTemplate;

    public VerificationResult verify() {
        String probeId = UUID.randomUUID().toString();
        Document probe = new Document("_id", probeId)
                .append("createdAt", Instant.now().toString())
                .append("purpose", "health-check");

        try {
            mongoTemplate.getCollection(VERIFICATION_COLLECTION).insertOne(probe);
            Document stored = mongoTemplate.getCollection(VERIFICATION_COLLECTION)
                    .find(new Document("_id", probeId)).first();
            boolean writeReadVerified = stored != null && probeId.equals(stored.getString("_id"));
            mongoTemplate.getCollection(VERIFICATION_COLLECTION).deleteOne(new Document("_id", probeId));
            return new VerificationResult(true, writeReadVerified, writeReadVerified ? "MongoDB write/read/delete verified" : "MongoDB write completed but read verification failed");
        } catch (Exception exception) {
            try {
                mongoTemplate.getCollection(VERIFICATION_COLLECTION).deleteOne(new Document("_id", probeId));
            } catch (Exception ignored) {
                // Preserve the original database failure for the health response.
            }
            return new VerificationResult(false, false, "MongoDB persistence verification failed");
        }
    }

    public record VerificationResult(boolean databaseReachable, boolean writeReadVerified, String message) {
    }
}