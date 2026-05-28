package com.roadguardian.backend.service;

import org.springframework.data.domain.Page;

import com.roadguardian.backend.model.dto.request.CreateAccidentRequest;
import com.roadguardian.backend.model.dto.request.UpdateAccidentRequest;
import com.roadguardian.backend.model.dto.response.AccidentResponse;

import java.util.List;

public interface AccidentService {

	AccidentResponse createAccident(CreateAccidentRequest request, Long reportedById);

    AccidentResponse createDemoAccident();

	AccidentResponse updateAccident(Long accidentId, UpdateAccidentRequest request);

	AccidentResponse getAccidentById(Long accidentId);

	List<AccidentResponse> getAllAccidents();

	Page<AccidentResponse> getAccidentsPaginated(int pageNumber, int pageSize, String sortBy, String sortDirection);

	List<AccidentResponse> getAccidentsBySeverity(String severity);

	List<AccidentResponse> getAccidentsByStatus(String status);

	List<AccidentResponse> getNearbyAccidents(Double latitude, Double longitude, Double radiusKm);

	List<AccidentResponse> getActiveAccidents();

	void assignAmbulance(Long accidentId, Long ambulanceUserId);

	void assignPolice(Long accidentId, Long policeUserId);

	void assignHospital(Long accidentId, Long hospitalUserId);

	void deleteAccident(Long accidentId);
}
