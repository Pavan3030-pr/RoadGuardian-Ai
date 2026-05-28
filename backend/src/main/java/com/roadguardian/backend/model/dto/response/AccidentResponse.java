package com.roadguardian.backend.model.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccidentResponse {

    private Long id;

    private String title;

    private String description;

    private Double latitude;

    private Double longitude;

    private String locationName;

    private String severity;

    private String status;

    private Integer riskScore;

    private Integer casualties;

    private String imageUrl;

    private String videoUrl;

    private UserResponse reportedBy;

    private UserResponse ambulanceAssigned;

    private UserResponse policeAssigned;

    private UserResponse hospitalAssigned;

    private Long responseTimeMs;

    private String weatherCondition;

    private String trafficDensity;

    private String roadType;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
