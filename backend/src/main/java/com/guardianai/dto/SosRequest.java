package com.guardianai.dto;

import lombok.Data;

@Data
public class SosRequest {
    private Double latitude;

    private Double longitude;

    private boolean simulated;

    private String message;
}
