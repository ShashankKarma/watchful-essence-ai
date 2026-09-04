package com.guardianai.dto;

import com.guardianai.model.AlertResponse;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AlertResponseRequest {
    @NotNull
    private AlertResponse response;
}
