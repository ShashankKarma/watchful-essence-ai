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
@Document(collection = "safety_tips")
public class SafetyTip {
    @Id
    private String id;
    private String title;
    private String description;
    private String category;
    private String icon;
    private LocalDateTime createdAt;
}
