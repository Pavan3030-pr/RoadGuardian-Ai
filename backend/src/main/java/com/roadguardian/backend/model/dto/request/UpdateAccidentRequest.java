package com.roadguardian.backend.model.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateAccidentRequest {

    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    private String severity;

    private String status;

    @Min(value = 0, message = "Casualties cannot be negative")
    private Integer casualties;

    private String imageUrl;

    private String videoUrl;

    private String weatherCondition;

    private String trafficDensity;

    private String roadType;
}
