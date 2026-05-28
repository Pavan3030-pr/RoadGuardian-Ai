package com.roadguardian.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.roadguardian.backend.model.dto.response.ApiResponse;
import com.roadguardian.backend.model.dto.response.DashboardMetricsResponse;
import com.roadguardian.backend.service.AnalyticsService;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Analytics and reporting endpoints")
public class AnalyticsController {

	private final AnalyticsService analyticsService;

	@GetMapping("/dashboard")
	@Operation(summary = "Get dashboard metrics", description = "Fetch comprehensive dashboard metrics")
	public ResponseEntity<ApiResponse<DashboardMetricsResponse>> getDashboardMetrics() {
		DashboardMetricsResponse metrics = analyticsService.getDashboardMetrics();
		return ResponseEntity.ok(new ApiResponse<>(true, "Dashboard metrics fetched", metrics));
	}

	@GetMapping("/total-accidents")
	@Operation(summary = "Get total accidents", description = "Get total count of accidents")
	public ResponseEntity<ApiResponse<Long>> getTotalAccidents() {
		Long total = analyticsService.getTotalAccidents();
		return ResponseEntity.ok(new ApiResponse<>(true, "Total accidents count", total));
	}

	@GetMapping("/critical-accidents")
	@Operation(summary = "Get critical accidents", description = "Get count of critical accidents")
	public ResponseEntity<ApiResponse<Long>> getCriticalAccidents() {
		Long critical = analyticsService.getCriticalAccidents();
		return ResponseEntity.ok(new ApiResponse<>(true, "Critical accidents count", critical));
	}

	@GetMapping("/resolved-accidents")
	@Operation(summary = "Get resolved accidents", description = "Get count of resolved accidents")
	public ResponseEntity<ApiResponse<Long>> getResolvedAccidents() {
		Long resolved = analyticsService.getResolvedAccidents();
		return ResponseEntity.ok(new ApiResponse<>(true, "Resolved accidents count", resolved));
	}

	@GetMapping("/critical-percentage")
	@Operation(summary = "Get critical percentage", description = "Get percentage of critical accidents")
	public ResponseEntity<ApiResponse<Double>> getCriticalPercentage() {
		Double percentage = analyticsService.getCriticalPercentage();
		return ResponseEntity.ok(new ApiResponse<>(true, "Critical accidents percentage", percentage));
	}

	@GetMapping("/resolved-percentage")
	@Operation(summary = "Get resolved percentage", description = "Get percentage of resolved accidents")
	public ResponseEntity<ApiResponse<Double>> getResolvedPercentage() {
		Double percentage = analyticsService.getResolvedPercentage();
		return ResponseEntity.ok(new ApiResponse<>(true, "Resolved accidents percentage", percentage));
	}

	@GetMapping("/total-users")
	@Operation(summary = "Get total users", description = "Get total count of system users")
	public ResponseEntity<ApiResponse<Long>> getTotalUsers() {
		Long total = analyticsService.getTotalUsers();
		return ResponseEntity.ok(new ApiResponse<>(true, "Total users count", total));
	}
}
