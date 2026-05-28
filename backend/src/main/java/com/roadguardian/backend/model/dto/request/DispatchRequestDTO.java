package com.roadguardian.backend.model.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DispatchRequestDTO {

    @NotNull(message = "Accident ID is required")
    private Long accidentId;

    @NotBlank(message = "Resource type is required")
    private String resourceType; // AMBULANCE, POLICE, HOSPITAL

    @NotNull(message = "User ID is required")
    private Long userId;

    private String remarks;
}
