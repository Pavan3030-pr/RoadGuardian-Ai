package com.roadguardian.backend.model.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardMetricsResponse {

    private Long totalAccidents;

    private Long criticalCases;

    private Long resolvedCases;

    private Long activeCases;

    private Double averageResponseTime;

    private Double criticalPercentage;

    private Long totalEmergencyResponses;

    private Long ambulancesDeployed;

    private Long policeUnitsDeployed;

    private Long hospitalsAlerted;

    private Long totalUsers;

    private Long accidentsToday;

    private Long accidentsThisWeek;

    private Long accidentsThisMonth;

    private Double resolvedPercentage;

    private Long activeUsers;

    private Long highCases;

    private Long moderateCases;

    private Long lowCases;

    private Long accidentsYesterday;

    private Long accidentsTwoDaysAgo;

    private Long accidentsThreeDaysAgo;

    private Long accidentsFourDaysAgo;

    private Long accidentsFiveDaysAgo;

    private Long accidentsSixDaysAgo;
}
