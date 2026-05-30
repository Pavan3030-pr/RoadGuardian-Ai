package com.roadguardian.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.roadguardian.backend.exception.ResourceNotFoundException;
import com.roadguardian.backend.model.entity.*;
import com.roadguardian.backend.repository.*;
import com.roadguardian.backend.service.DispatchService;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DispatchServiceImpl implements DispatchService {

	private final EmergencyResponseRepository emergencyResponseRepository;
	private final AccidentRepository accidentRepository;
	private final UserRepository userRepository;

	public void dispatchAmbulance(Long accidentId, Long ambulanceUserId) {
		Accident accident = accidentRepository.findById(accidentId)
				.orElseThrow(() -> new ResourceNotFoundException("Accident not found"));

		User ambulance = userRepository.findById(ambulanceUserId)
				.orElseThrow(() -> new ResourceNotFoundException("Ambulance not found"));

		EmergencyResponse response = EmergencyResponse.builder()
				.accident(accident)
				.responseType(EmergencyResponse.ResponseType.AMBULANCE)
				.status(EmergencyResponse.ResponseStatus.DISPATCHED)
				.responder(ambulance)
				.currentLatitude(accident.getLatitude() + 0.015)
				.currentLongitude(accident.getLongitude() + 0.015)
				.etaMinutes(5)
				.build();

		emergencyResponseRepository.save(response);

		accident.setAmbulanceAssigned(ambulance);
		accident.setStatus(Accident.IncidentStatus.AMBULANCE_ASSIGNED);
		accidentRepository.save(accident);

		log.info("Ambulance dispatched for accident: {}", accidentId);
	}

	public void dispatchPolice(Long accidentId, Long policeUserId) {
		Accident accident = accidentRepository.findById(accidentId)
				.orElseThrow(() -> new ResourceNotFoundException("Accident not found"));

		User police = userRepository.findById(policeUserId)
				.orElseThrow(() -> new ResourceNotFoundException("Police not found"));

		EmergencyResponse response = EmergencyResponse.builder()
				.accident(accident)
				.responseType(EmergencyResponse.ResponseType.POLICE)
				.status(EmergencyResponse.ResponseStatus.DISPATCHED)
				.responder(police)
				.currentLatitude(accident.getLatitude())
				.currentLongitude(accident.getLongitude())
				.etaMinutes(8)
				.build();

		emergencyResponseRepository.save(response);

		accident.setPoliceAssigned(police);
		accident.setStatus(Accident.IncidentStatus.POLICE_ASSIGNED);
		accidentRepository.save(accident);

		log.info("Police dispatched for accident: {}", accidentId);
	}

	public void dispatchHospital(Long accidentId, Long hospitalUserId) {
		Accident accident = accidentRepository.findById(accidentId)
				.orElseThrow(() -> new ResourceNotFoundException("Accident not found"));

		User hospital = userRepository.findById(hospitalUserId)
				.orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));

		EmergencyResponse response = EmergencyResponse.builder()
				.accident(accident)
				.responseType(EmergencyResponse.ResponseType.HOSPITAL_COORDINATION)
				.status(EmergencyResponse.ResponseStatus.DISPATCHED)
				.responder(hospital)
				.currentLatitude(accident.getLatitude())
				.currentLongitude(accident.getLongitude())
				.etaMinutes(0)
				.build();

		emergencyResponseRepository.save(response);

		accident.setHospitalAssigned(hospital);
		accident.setStatus(Accident.IncidentStatus.HOSPITAL_ALERTED);
		accidentRepository.save(accident);

		log.info("Hospital alerted for accident: {}", accidentId);
	}

	public void updateResponseStatus(Long responseId, String status) {
		EmergencyResponse response = emergencyResponseRepository.findById(responseId)
				.orElseThrow(() -> new ResourceNotFoundException("Response not found"));

		response.setStatus(EmergencyResponse.ResponseStatus.valueOf(status.toUpperCase()));
		if (response.getStatus() == EmergencyResponse.ResponseStatus.ARRIVED) {
			response.setArrivedAt(java.time.LocalDateTime.now());
			if (response.getResponseType() == EmergencyResponse.ResponseType.AMBULANCE) {
				response.getAccident().setStatus(Accident.IncidentStatus.AMBULANCE_ARRIVED);
			}
		}
		if (response.getStatus() == EmergencyResponse.ResponseStatus.COMPLETED) {
			response.setCompletedAt(java.time.LocalDateTime.now());
			if (response.getResponseType() == EmergencyResponse.ResponseType.AMBULANCE) {
				response.getAccident().setStatus(Accident.IncidentStatus.PATIENT_PICKED);
			}
			if (response.getResponseType() == EmergencyResponse.ResponseType.HOSPITAL_COORDINATION) {
				response.getAccident().setStatus(Accident.IncidentStatus.REACHED_HOSPITAL);
			}
		}
		emergencyResponseRepository.save(response);
		accidentRepository.save(response.getAccident());

		log.info("Response status updated to: {}", status);
	}

	public void escalateIncident(Long accidentId, String remarks) {
		Accident accident = accidentRepository.findById(accidentId)
				.orElseThrow(() -> new ResourceNotFoundException("Accident not found"));

		accident.setStatus(Accident.IncidentStatus.ESCALATED);
		accidentRepository.save(accident);

		log.info("Incident escalated: {} - Remarks: {}", accidentId, remarks);
	}

	public void markIncidentResolved(Long accidentId) {
		Accident accident = accidentRepository.findById(accidentId)
				.orElseThrow(() -> new ResourceNotFoundException("Accident not found"));

		accident.setStatus(Accident.IncidentStatus.CASE_CLOSED);
		accident.setResolvedAt(java.time.LocalDateTime.now());
		accidentRepository.save(accident);

		log.info("Incident marked as resolved: {}", accidentId);
	}
}
