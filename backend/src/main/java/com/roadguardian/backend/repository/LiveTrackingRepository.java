package com.roadguardian.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.roadguardian.backend.model.entity.LiveTracking;
import java.util.List;
import java.util.Optional;

@Repository
public interface LiveTrackingRepository extends JpaRepository<LiveTracking, Long> {
	Optional<LiveTracking> findTopByUser_IdOrderByLastUpdatedDesc(Long userId);
	List<LiveTracking> findByAccidentId(Long accidentId);
}
