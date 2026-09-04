package com.guardianai.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "monitoring_sessions")
public class MonitoringSession {
    @Id
    private String id;
    private String userId;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private boolean active;
    private long behaviourCount;
}
