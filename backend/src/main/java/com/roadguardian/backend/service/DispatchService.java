package com.roadguardian.backend.service;

public interface DispatchService {

	void dispatchAmbulance(Long accidentId, Long ambulanceUserId);

	void dispatchPolice(Long accidentId, Long policeUserId);

	void dispatchHospital(Long accidentId, Long hospitalUserId);

	void updateResponseStatus(Long responseId, String status);

	void escalateIncident(Long accidentId, String remarks);

	void markIncidentResolved(Long accidentId);
}
