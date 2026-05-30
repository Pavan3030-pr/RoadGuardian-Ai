package com.roadguardian.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.roadguardian.backend.model.entity.AIRecommendation;
import java.util.List;
import java.util.Optional;

@Repository
public interface AIRecommendationRepository extends JpaRepository<AIRecommendation, Long> {
	List<AIRecommendation> findByAccidentId(Long accidentId);
	Optional<AIRecommendation> findTopByAccidentIdOrderByCreatedAtDesc(Long accidentId);
}
