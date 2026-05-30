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

    private String area;

    private String street;

    private String village;

    private String district;

    private String state;

    private String severity;

    private String status;

    private Integer riskScore;

    private Integer casualties;

    private String imageUrl;

    private String videoUrl;

    private AIAnalysisResponse aiAnalysis;

    private java.util.List<ProgressEventResponse> progressTimeline;

    private String currentResponderStatus;

    private Integer etaMinutes;

    private Double ambulanceLatitude;

    private Double ambulanceLongitude;

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

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AIAnalysisResponse {
        private String severity;
        private Integer confidenceScore;
        private Integer vehiclesDetected;
        private Integer injuredPersons;
        private String emergencyPriority;
        private String aiSummary;
        private String recommendedResponse;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProgressEventResponse {
        private String status;
        private LocalDateTime timestamp;
        private String detail;
    }
}
