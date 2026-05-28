package com.roadguardian.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.roadguardian.backend.model.dto.response.DashboardMetricsResponse;
import com.roadguardian.backend.repository.AccidentRepository;
import com.roadguardian.backend.repository.UserRepository;
import com.roadguardian.backend.repository.AnalyticsEventRepository;
import com.roadguardian.backend.model.entity.Accident;
import com.roadguardian.backend.model.entity.AnalyticsEvent;
import com.roadguardian.backend.service.AnalyticsService;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsServiceImpl implements AnalyticsService {

	private final AccidentRepository accidentRepository;
	private final UserRepository userRepository;
	private final AnalyticsEventRepository analyticsEventRepository;

	@Override
	@Transactional(readOnly = true)
	public DashboardMetricsResponse getDashboardMetrics() {
		long totalAccidents = accidentRepository.count();
		long criticalCases = accidentRepository.countBySeverityAndDeletedFalse(Accident.SeverityLevel.CRITICAL);
		long resolvedCases = accidentRepository.countByStatusAndDeletedFalse(Accident.IncidentStatus.RESOLVED);
		long activeCases = totalAccidents - resolvedCases;

		LocalDateTime now = LocalDateTime.now();
		LocalDateTime today = now.truncatedTo(ChronoUnit.DAYS);
		LocalDateTime weekAgo = now.minusWeeks(1);
		LocalDateTime monthAgo = now.minusMonths(1);

		long accidentsToday = accidentRepository.countAccidentsBetween(today, now);
		long accidentsThisWeek = accidentRepository.countAccidentsBetween(weekAgo, now);
		long accidentsThisMonth = accidentRepository.countAccidentsBetween(monthAgo, now);

		double averageResponseTime = calculateAverageResponseTime();
		double criticalPercentage = totalAccidents > 0 ? (criticalCases * 100.0) / totalAccidents : 0;
		double resolvedPercentage = totalAccidents > 0 ? (resolvedCases * 100.0) / totalAccidents : 0;

		long totalUsers = userRepository.count();

		return DashboardMetricsResponse.builder()
				.totalAccidents(totalAccidents)
				.criticalCases(criticalCases)
				.resolvedCases(resolvedCases)
				.activeCases(activeCases)
				.averageResponseTime(averageResponseTime)
				.criticalPercentage(criticalPercentage)
				.totalEmergencyResponses(0L) // Calculate from EmergencyResponse table
				.ambulancesDeployed(0L) // Calculate from assignments
				.policeUnitsDeployed(0L) // Calculate from assignments
				.hospitalsAlerted(0L) // Calculate from assignments
				.totalUsers(totalUsers)
				.accidentsToday(accidentsToday)
				.accidentsThisWeek(accidentsThisWeek)
				.accidentsThisMonth(accidentsThisMonth)
				.resolvedPercentage(resolvedPercentage)
				.build();
	}

	@Override
	@Transactional
	public void logEvent(String eventType, String eventData, Long userId, Long accidentId) {
		AnalyticsEvent event = AnalyticsEvent.builder()
				.eventType(eventType)
				.eventData(eventData)
				.user(userId != null ? userRepository.findById(userId).orElse(null) : null)
				.accident(accidentId != null ? accidentRepository.findById(accidentId).orElse(null) : null)
				.build();
		analyticsEventRepository.save(event);
		log.debug("Logged analytics event: {}", eventType);
	}

	private double calculateAverageResponseTime() {
		// Calculate average response time from resolved incidents
		// For now, returning 0 - this would need data from your database
		return 0.0;
	}

	@Override
	@Transactional(readOnly = true)
	public Long getTotalAccidents() {
		return accidentRepository.count();
	}

	@Override
	@Transactional(readOnly = true)
	public Long getCriticalAccidents() {
		return accidentRepository.countBySeverityAndDeletedFalse(Accident.SeverityLevel.CRITICAL);
	}

	@Override
	@Transactional(readOnly = true)
	public Long getResolvedAccidents() {
		return accidentRepository.countByStatusAndDeletedFalse(Accident.IncidentStatus.RESOLVED);
	}

	@Override
	@Transactional(readOnly = true)
	public Long getAccidentsInDateRange(LocalDateTime startDate, LocalDateTime endDate) {
		return accidentRepository.countAccidentsBetween(startDate, endDate);
	}

	@Override
	@Transactional(readOnly = true)
	public Long getTotalUsers() {
		return userRepository.count();
	}

	@Override
	@Transactional(readOnly = true)
	public Long getActiveUsers() {
		// Count active users - this would need a query in UserRepository
		return 0L;
	}

	@Override
	@Transactional(readOnly = true)
	public Double getCriticalPercentage() {
		long total = accidentRepository.count();
		long critical = accidentRepository.countBySeverityAndDeletedFalse(Accident.SeverityLevel.CRITICAL);
		return total > 0 ? (critical * 100.0) / total : 0.0;
	}

	@Override
	@Transactional(readOnly = true)
	public Double getResolvedPercentage() {
		long total = accidentRepository.count();
		long resolved = accidentRepository.countByStatusAndDeletedFalse(Accident.IncidentStatus.RESOLVED);
		return total > 0 ? (resolved * 100.0) / total : 0.0;
	}
}
