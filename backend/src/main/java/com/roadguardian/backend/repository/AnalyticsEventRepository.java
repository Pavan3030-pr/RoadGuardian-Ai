package com.roadguardian.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.roadguardian.backend.model.entity.AnalyticsEvent;
import java.util.List;

@Repository
public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {
	List<AnalyticsEvent> findByEventType(String eventType);
	List<AnalyticsEvent> findByUserId(Long userId);
	List<AnalyticsEvent> findByAccidentId(Long accidentId);
}
