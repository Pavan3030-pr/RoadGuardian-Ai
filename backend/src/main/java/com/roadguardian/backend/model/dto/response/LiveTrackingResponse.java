package com.roadguardian.backend.model.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiveTrackingResponse {

    private Long id;

    private Long userId;

    private String userName;

    private Double latitude;

    private Double longitude;

    private String status;

    private String resourceType; // AMBULANCE, POLICE

    private Double speed;

    private String direction;

    private LocalDateTime lastUpdated;

    private Long accidentId;
}
