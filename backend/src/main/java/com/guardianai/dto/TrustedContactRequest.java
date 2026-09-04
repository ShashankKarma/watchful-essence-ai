package com.guardianai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TrustedContactRequest {
    @NotBlank
    private String name;

    private String relationship;

    @NotBlank
    private String phone;

    private String email;

    private int priority;

    private boolean notificationEnabled = true;
}
