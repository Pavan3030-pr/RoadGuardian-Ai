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

		AIRecommendation recommendation = AIRecommendation.builder()
				.accident(accident)
				.severity(accident.getSeverity().name())
				.ambulanceNeeded(ambulanceNeeded)
				.hospitalRequired(hospitalRequired)
				.policeAlertLevel(policeAlertLevel)
				.roadblockRequired(roadblockRequired)
				.weatherCondition(weatherCondition)
				.trafficDensity(trafficDensity)
				.confidenceScore(confidenceScore)
				.build();

		recommendation = aiRecommendationRepository.save(recommendation);
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
				.build();
	}
}
