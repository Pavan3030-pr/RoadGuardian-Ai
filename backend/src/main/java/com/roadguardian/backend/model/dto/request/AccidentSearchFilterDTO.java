package com.roadguardian.backend.model.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccidentSearchFilterDTO {

    private String severity;

    private String status;

    private Double radiusKm;

    private Double latitude;

    private Double longitude;

    private String locationName;

    private Long fromDate;

    private Long toDate;

    private Integer minCasualties;

    private Integer maxCasualties;

    private Integer pageNumber = 0;

    private Integer pageSize = 20;

    private String sortBy = "createdAt";

    private String sortDirection = "DESC";
}
