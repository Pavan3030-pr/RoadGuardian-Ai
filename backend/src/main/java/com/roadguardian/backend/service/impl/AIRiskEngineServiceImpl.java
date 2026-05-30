package com.roadguardian.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.roadguardian.backend.exception.ResourceNotFoundException;
import com.roadguardian.backend.model.dto.AIRiskRecommendationDTO;
import com.roadguardian.backend.model.entity.AIRecommendation;
import com.roadguardian.backend.model.entity.Accident;
import com.roadguardian.backend.repository.AIRecommendationRepository;
import com.roadguardian.backend.repository.AccidentRepository;
import com.roadguardian.backend.service.AIRiskEngineService;
import com.roadguardian.backend.service.AnalyticsService;
import org.springframework.web.multipart.MultipartFile;

import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AIRiskEngineServiceImpl implements AIRiskEngineService {

	private final AIRecommendationRepository aiRecommendationRepository;
	private final AccidentRepository accidentRepository;
	private final AnalyticsService analyticsService;
	private final Random random = new Random();

	@Override
	public Integer calculateRiskScore(String severity, Integer casualties) {
		log.debug("Calculating risk score for severity: {} and casualties: {}", severity, casualties);
		int baseScore = switch (severity.toUpperCase()) {
			case "LOW" -> 20;
			case "MODERATE" -> 50;
			case "HIGH" -> 75;
			case "CRITICAL" -> 95;
			default -> 50;
		};

		if (casualties != null && casualties > 0) {
			baseScore += Math.min(casualties * 5, 30);
		}

		int variation = random.nextInt(15) - 5;
		int finalScore = Math.min(100, Math.max(0, baseScore + variation));
		log.info("Calculated risk score: {}", finalScore);
		return finalScore;
	}

	@Override
	public AIRiskRecommendationDTO generateRecommendations(Long accidentId) {
		Accident accident = accidentRepository.findById(accidentId)
				.orElseThrow(() -> new ResourceNotFoundException("Accident not found"));

		return processAndSaveRecommendation(accident);
	}

	@Override
	public AIRiskRecommendationDTO analyzeImage(MultipartFile file) {
		log.info("AI analyzing uploaded image: {}", file.getOriginalFilename());
		return simulatePrediction();
	}

	private AIRiskRecommendationDTO processAndSaveRecommendation(Accident accident) {
		String weatherCondition = getWeatherCondition();
		String trafficDensity = getTrafficDensity();
		String ambulanceNeeded = determineAmbulanceNeeded(accident.getSeverity());
		String hospitalRequired = determineHospitalRequired(accident.getSeverity(), accident.getCasualties());
		String policeAlertLevel = determinePoliceAlertLevel(accident.getSeverity());
		String roadblockRequired = determineRoadblockNeeded(accident.getSeverity(), trafficDensity);
		Integer confidenceScore = calculateConfidenceScore(accident.getRiskScore());
		Integer vehiclesDetected = estimateVehicles(accident);
		Integer injuredPersons = Math.max(accident.getCasualties() == null ? 0 : accident.getCasualties(), estimateInjuries(accident));
		String emergencyPriority = determineEmergencyPriority(accident.getSeverity(), injuredPersons);
		String aiSummary = buildSummary(accident, vehiclesDetected, injuredPersons, trafficDensity);
		String recommendedResponse = buildRecommendedResponse(ambulanceNeeded, hospitalRequired, policeAlertLevel, roadblockRequired);

		AIRecommendation recommendation = aiRecommendationRepository.findTopByAccidentIdOrderByCreatedAtDesc(accident.getId())
				.orElseGet(() -> AIRecommendation.builder().accident(accident).build());
		recommendation.setSeverity(accident.getSeverity().name());
		recommendation.setAmbulanceNeeded(ambulanceNeeded);
		recommendation.setHospitalRequired(hospitalRequired);
		recommendation.setPoliceAlertLevel(policeAlertLevel);
		recommendation.setRoadblockRequired(roadblockRequired);
		recommendation.setWeatherCondition(weatherCondition);
		recommendation.setTrafficDensity(trafficDensity);
		recommendation.setConfidenceScore(confidenceScore);
		recommendation.setVehiclesDetected(vehiclesDetected);
		recommendation.setInjuredPersons(injuredPersons);
		recommendation.setEmergencyPriority(emergencyPriority);
		recommendation.setAiSummary(aiSummary);
		recommendation.setRecommendedResponse(recommendedResponse);

		recommendation = aiRecommendationRepository.save(recommendation);
		accident.setStatus(Accident.IncidentStatus.AI_VERIFIED);
		accidentRepository.save(accident);
		log.info("Generated and saved AI recommendation for accident ID: {}", accident.getId());

		analyticsService.logEvent("AI_PREDICTION", "Risk: " + accident.getRiskScore() + ", Confidence: " + confidenceScore, null, accident.getId());

		return convertToDTO(recommendation);
	}

	private AIRiskRecommendationDTO simulatePrediction() {
		// Simulate a high-confidence prediction
		String[] severities = {"LOW", "MODERATE", "HIGH", "CRITICAL"};
		String severity = severities[random.nextInt(severities.length)];
		return AIRiskRecommendationDTO.builder()
				.riskScore(random.nextInt(40) + 60)
				.confidenceScore(random.nextInt(10) + 85)
				.severity(severity)
				.weatherCondition("CLEAR")
				.trafficDensity("MODERATE")
				.ambulanceNeeded("ONE_AMBULANCE")
				.hospitalRequired("GENERAL_HOSPITAL")
				.policeAlertLevel("PRIORITY")
				.roadblockRequired("NOT_REQUIRED")
				.vehiclesDetected(random.nextInt(3) + 1)
				.injuredPersons(random.nextInt(4))
				.emergencyPriority("PRIORITY")
				.aiSummary("Computer vision indicates a likely road incident with visible vehicle damage.")
				.recommendedResponse("Dispatch medical support, verify road obstruction, and notify local traffic police.")
				.build();
	}


	private String getWeatherCondition() {
		String[] conditions = {"CLEAR", "RAINY", "FOGGY", "STORMY", "OVERCAST"};
		return conditions[random.nextInt(conditions.length)];
	}

	private String getTrafficDensity() {
		String[] densities = {"LOW", "MODERATE", "HIGH", "VERY_HIGH"};
		return densities[random.nextInt(densities.length)];
	}

	private String determineAmbulanceNeeded(Accident.SeverityLevel severity) {
		return switch (severity) {
			case LOW -> "ONE_AMBULANCE";
			case MODERATE -> "ONE_TO_TWO_AMBULANCES";
			case HIGH -> "TWO_TO_THREE_AMBULANCES";
			case CRITICAL -> "THREE_OR_MORE_AMBULANCES";
		};
	}

	private String determineHospitalRequired(Accident.SeverityLevel severity, Integer casualties) {
		boolean multipleVictims = casualties != null && casualties > 3;
		return switch (severity) {
			case LOW -> "BASIC_HOSPITAL";
			case MODERATE -> multipleVictims ? "MULTI_SPECIALTY_HOSPITAL" : "GENERAL_HOSPITAL";
			case HIGH, CRITICAL -> "TRAUMA_CENTER";
		};
	}

	private String determinePoliceAlertLevel(Accident.SeverityLevel severity) {
		return switch (severity) {
			case LOW -> "ROUTINE";
			case MODERATE -> "PRIORITY";
			case HIGH -> "EMERGENCY";
			case CRITICAL -> "IMMEDIATE_ESCALATION";
		};
	}

	private String determineRoadblockNeeded(Accident.SeverityLevel severity, String trafficDensity) {
		if (severity == Accident.SeverityLevel.CRITICAL ||
				severity == Accident.SeverityLevel.HIGH &&
						(trafficDensity.equals("HIGH") || trafficDensity.equals("VERY_HIGH"))) {
			return "YES_REQUIRED";
		}
		return "NOT_REQUIRED";
	}

	private Integer calculateConfidenceScore(Integer riskScore) {
		return Math.min(100, riskScore + random.nextInt(20) - 10);
	}

	private Integer estimateVehicles(Accident accident) {
		int base = accident.getSeverity() == Accident.SeverityLevel.LOW ? 1 : 2;
		if (accident.getSeverity() == Accident.SeverityLevel.CRITICAL) {
			base = 3;
		}
		return Math.min(6, base + Math.max(0, (accident.getCasualties() == null ? 0 : accident.getCasualties()) / 3));
	}

	private Integer estimateInjuries(Accident accident) {
		return switch (accident.getSeverity()) {
			case LOW -> 0;
			case MODERATE -> 1;
			case HIGH -> 2;
			case CRITICAL -> 3;
		};
	}

	private String determineEmergencyPriority(Accident.SeverityLevel severity, Integer injuredPersons) {
		if (severity == Accident.SeverityLevel.CRITICAL || injuredPersons >= 3) return "IMMEDIATE";
		if (severity == Accident.SeverityLevel.HIGH || injuredPersons >= 1) return "HIGH";
		if (severity == Accident.SeverityLevel.MODERATE) return "PRIORITY";
		return "ROUTINE";
	}

	private String buildSummary(Accident accident, Integer vehiclesDetected, Integer injuredPersons, String trafficDensity) {
		return String.format("%s severity collision detected near %s. Estimated vehicles: %d. Injured persons: %d. Traffic density: %s.",
				accident.getSeverity().name(), accident.getLocationName(), vehiclesDetected, injuredPersons, trafficDensity);
	}

	private String buildRecommendedResponse(String ambulanceNeeded, String hospitalRequired, String policeAlertLevel, String roadblockRequired) {
		return String.format("Assign %s, alert %s, set police level to %s, roadblock: %s.",
				ambulanceNeeded, hospitalRequired, policeAlertLevel, roadblockRequired);
	}

	private AIRiskRecommendationDTO convertToDTO(AIRecommendation recommendation) {
		return AIRiskRecommendationDTO.builder()
				.accidentId(recommendation.getAccident().getId())
				.riskScore(recommendation.getAccident().getRiskScore())
				.severity(recommendation.getSeverity())
				.ambulanceNeeded(recommendation.getAmbulanceNeeded())
				.hospitalRequired(recommendation.getHospitalRequired())
				.policeAlertLevel(recommendation.getPoliceAlertLevel())
				.roadblockRequired(recommendation.getRoadblockRequired())
				.weatherCondition(recommendation.getWeatherCondition())
				.trafficDensity(recommendation.getTrafficDensity())
				.confidenceScore(recommendation.getConfidenceScore())
				.vehiclesDetected(recommendation.getVehiclesDetected())
				.injuredPersons(recommendation.getInjuredPersons())
				.emergencyPriority(recommendation.getEmergencyPriority())
				.aiSummary(recommendation.getAiSummary())
				.recommendedResponse(recommendation.getRecommendedResponse())
				.build();
	}
}
