package com.roadguardian.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.roadguardian.backend.model.entity.EmergencyResponse;
import java.util.List;

@Repository
public interface EmergencyResponseRepository extends JpaRepository<EmergencyResponse, Long> {
	List<EmergencyResponse> findByAccidentId(Long accidentId);
	List<EmergencyResponse> findByResponderId(Long userId);
	    List<EmergencyResponse> findByResponseTypeAndStatus(
		    EmergencyResponse.ResponseType responseType,
		    EmergencyResponse.ResponseStatus status
	    );
}
