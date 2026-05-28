package com.roadguardian.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_recommendations", indexes = {
	@Index(name = "idx_ai_recommendations_accident_id", columnList = "accident_id"),
	@Index(name = "idx_ai_recommendations_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIRecommendation {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "accident_id", nullable = false)
	private Accident accident;

	private String severity;

	private String ambulanceNeeded;

	private String hospitalRequired;

	private String policeAlertLevel;

	private String roadblockRequired;

	private String weatherCondition;

	private String trafficDensity;

	private Integer confidenceScore;

	@CreationTimestamp
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;
}
