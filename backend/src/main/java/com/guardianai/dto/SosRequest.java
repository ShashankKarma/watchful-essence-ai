package com.guardianai.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SosRequest {
    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private String message;
}
