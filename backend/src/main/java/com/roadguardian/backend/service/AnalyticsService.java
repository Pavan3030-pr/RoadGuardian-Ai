package com.roadguardian.backend.service;

import com.roadguardian.backend.model.dto.response.DashboardMetricsResponse;

import java.time.LocalDateTime;

public interface AnalyticsService {

	DashboardMetricsResponse getDashboardMetrics();

	Long getTotalAccidents();

	Long getCriticalAccidents();

	Long getResolvedAccidents();

	Long getAccidentsInDateRange(LocalDateTime startDate, LocalDateTime endDate);

	Long getTotalUsers();

	Long getActiveUsers();

	Double getCriticalPercentage();

	Double getResolvedPercentage();

	void logEvent(String eventType, String eventData, Long userId, Long accidentId);
}
