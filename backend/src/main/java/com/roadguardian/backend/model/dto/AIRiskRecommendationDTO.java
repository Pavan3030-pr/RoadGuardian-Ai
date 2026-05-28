package com.roadguardian.backend.model.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIRiskRecommendationDTO {
	private Long accidentId;
	private Integer riskScore;
	private String severity;
	private String ambulanceNeeded;
	private String hospitalRequired;
	private String policeAlertLevel;
	private String roadblockRequired;
	private String weatherCondition;
	private String trafficDensity;
	private Integer confidenceScore;
	private String recommendation;
}
