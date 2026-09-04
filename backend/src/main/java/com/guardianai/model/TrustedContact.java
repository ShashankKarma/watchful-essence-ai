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
@Document(collection = "trusted_contacts")
public class TrustedContact {
    @Id
    private String id;
    private String userId;
    private String name;
    private String relationship;
    private String phone;
    private String email;
    private int priority;
    private boolean notificationEnabled;
    private LocalDateTime createdAt;
}
