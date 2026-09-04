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
@Document(collection = "location_data")
public class LocationData {
    @Id
    private String id;
    private String userId;
    private double latitude;
    private double longitude;
    private double accuracy;
    private LocalDateTime timestamp;
}
