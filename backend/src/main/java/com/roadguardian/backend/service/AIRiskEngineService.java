package com.roadguardian.backend.service;

import com.roadguardian.backend.model.dto.AIRiskRecommendationDTO;
import org.springframework.web.multipart.MultipartFile;

public interface AIRiskEngineService {
	Integer calculateRiskScore(String severity, Integer casualties);
	AIRiskRecommendationDTO generateRecommendations(Long accidentId);
	AIRiskRecommendationDTO analyzeImage(MultipartFile file);
}
