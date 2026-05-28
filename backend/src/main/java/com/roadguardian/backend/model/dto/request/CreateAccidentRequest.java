package com.roadguardian.backend.model.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAccidentRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotNull(message = "Latitude is required")
    @DecimalMin("-90.0")
    @DecimalMax("90.0")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin("-180.0")
    @DecimalMax("180.0")
    private Double longitude;

    @NotBlank(message = "Location name is required")
    private String locationName;

    @NotBlank(message = "Severity is required")
    private String severity;

    @Min(value = 0, message = "Casualties cannot be negative")
    private Integer casualties;

    private String imageUrl;

    private String videoUrl;

    private String weatherCondition;

    private String trafficDensity;

    private String roadType;
}
