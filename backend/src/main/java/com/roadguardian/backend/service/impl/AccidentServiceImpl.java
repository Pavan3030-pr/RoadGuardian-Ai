package com.roadguardian.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.roadguardian.backend.exception.ResourceNotFoundException;
import com.roadguardian.backend.model.dto.request.CreateAccidentRequest;
import com.roadguardian.backend.model.dto.request.UpdateAccidentRequest;
import com.roadguardian.backend.model.dto.response.AccidentResponse;
import com.roadguardian.backend.model.entity.Accident;
import com.roadguardian.backend.model.entity.Role;
import com.roadguardian.backend.model.entity.User;
import com.roadguardian.backend.model.dto.response.UserResponse;
import com.roadguardian.backend.model.entity.EmergencyResponse;
import com.roadguardian.backend.repository.AccidentRepository;
import com.roadguardian.backend.repository.EmergencyResponseRepository;
import com.roadguardian.backend.repository.RoleRepository;
import com.roadguardian.backend.repository.UserRepository;
import com.roadguardian.backend.service.AccidentService;
import com.roadguardian.backend.service.NotificationService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AccidentServiceImpl implements AccidentService {

	private final AccidentRepository accidentRepository;
	private final EmergencyResponseRepository emergencyResponseRepository;
	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final PasswordEncoder passwordEncoder;
	private final SimpMessagingTemplate messagingTemplate;
	private final NotificationService notificationService;

	public AccidentResponse createAccident(CreateAccidentRequest request, Long reportedById) {
		User reportedBy = reportedById != null
				? userRepository.findById(reportedById).orElseGet(this::getOrCreateAnonymousReporter)
				: getOrCreateAnonymousReporter();

		Accident accident = Accident.builder()
				.title(request.getTitle())
				.description(request.getDescription())
				.latitude(request.getLatitude())
				.longitude(request.getLongitude())
				.locationName(request.getLocationName())
				.severity(Accident.SeverityLevel.valueOf(request.getSeverity().toUpperCase()))
				.status(Accident.IncidentStatus.REPORTED)
				.riskScore(calculateRiskScore(request))
				.casualties(request.getCasualties() != null ? request.getCasualties() : 0)
				.imageUrl(request.getImageUrl())
				.videoUrl(request.getVideoUrl())
				.reportedBy(reportedBy)
				.weatherCondition(request.getWeatherCondition())
				.trafficDensity(request.getTrafficDensity())
				.roadType(request.getRoadType())
				.build();

		accident = accidentRepository.save(accident);
		log.info("Accident created with ID: {}", accident.getId());
		messagingTemplate.convertAndSend("/topic/incidents", convertToResponse(accident));
		notificationService.broadcastNewAccident(accident.getId(), accident.getLocationName());

		return convertToResponse(accident);
	}

	public AccidentResponse createDemoAccident() {
		CreateAccidentRequest demoRequest = CreateAccidentRequest.builder()
				.title("Demo Accident Alert")
				.description("A live demo accident created for emergency dispatch testing.")
				.latitude(13.0827)
				.longitude(80.2707)
				.locationName("Chennai Demo Route")
				.severity("HIGH")
				.casualties(2)
				.weatherCondition("RAINY")
				.trafficDensity("HIGH")
				.roadType("HIGHWAY")
				.imageUrl("")
				.videoUrl("")
				.build();

		AccidentResponse response = createAccident(demoRequest, null);
		log.info("Demo accident created with ID: {}", response.getId());
		return response;
	}

	public AccidentResponse updateAccident(Long accidentId, UpdateAccidentRequest request) {
		Accident accident = accidentRepository.findById(accidentId)
				.orElseThrow(() -> new ResourceNotFoundException("Accident not found with ID: " + accidentId));

		if (request.getTitle() != null) {
			accident.setTitle(request.getTitle());
		}
		if (request.getDescription() != null) {
			accident.setDescription(request.getDescription());
		}
		if (request.getSeverity() != null) {
			accident.setSeverity(Accident.SeverityLevel.valueOf(request.getSeverity().toUpperCase()));
		}
		if (request.getStatus() != null) {
			Accident.IncidentStatus oldStatus = accident.getStatus();
			accident.setStatus(Accident.IncidentStatus.valueOf(request.getStatus().toUpperCase()));

			if (!oldStatus.equals(accident.getStatus())) {
				long responseTime = LocalDateTime.now().getNano() - accident.getCreatedAt().getNano();
				accident.setResponseTimeMs(responseTime / 1_000_000);
			}
		}
		if (request.getCasualties() != null) {
			accident.setCasualties(request.getCasualties());
		}
		if (request.getImageUrl() != null) {
			accident.setImageUrl(request.getImageUrl());
		}
		if (request.getVideoUrl() != null) {
			accident.setVideoUrl(request.getVideoUrl());
		}
		if (request.getWeatherCondition() != null) {
			accident.setWeatherCondition(request.getWeatherCondition());
		}
		if (request.getTrafficDensity() != null) {
			accident.setTrafficDensity(request.getTrafficDensity());
		}
		if (request.getRoadType() != null) {
			accident.setRoadType(request.getRoadType());
		}

		accident = accidentRepository.save(accident);
		log.info("Accident updated with ID: {}", accidentId);
		messagingTemplate.convertAndSend("/topic/incidents", convertToResponse(accident));

		return convertToResponse(accident);
	}

	public AccidentResponse getAccidentById(Long accidentId) {
		Accident accident = accidentRepository.findById(accidentId)
				.orElseThrow(() -> new ResourceNotFoundException("Accident not found with ID: " + accidentId));

		return convertToResponse(accident);
	}

	public List<AccidentResponse> getAllAccidents() {
		return accidentRepository.findAll().stream()
				.filter(a -> a.getDeleted() == null || !a.getDeleted())
				.map(this::convertToResponse)
				.collect(Collectors.toList());
	}

	public Page<AccidentResponse> getAccidentsPaginated(int pageNumber, int pageSize, String sortBy, String sortDirection) {
		Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
		Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(direction, sortBy));

		// Note: Ideally this should use a repository method that filters by deleted=false
		return accidentRepository.findAll(pageable)
				.map(this::convertToResponse);
	}

	public List<AccidentResponse> getAccidentsBySeverity(String severity) {
		Accident.SeverityLevel severityLevel = Accident.SeverityLevel.valueOf(severity.toUpperCase());
		return accidentRepository.findBySeverityAndDeletedFalse(severityLevel).stream()
				.map(this::convertToResponse)
				.collect(Collectors.toList());
	}

	public List<AccidentResponse> getAccidentsByStatus(String status) {
		Accident.IncidentStatus incidentStatus = Accident.IncidentStatus.valueOf(status.toUpperCase());
		return accidentRepository.findByStatusAndDeletedFalse(incidentStatus).stream()
				.map(this::convertToResponse)
				.collect(Collectors.toList());
	}

	public List<AccidentResponse> getNearbyAccidents(Double latitude, Double longitude, Double radiusKm) {
		return accidentRepository.findNearbyAccidents(latitude, longitude, radiusKm).stream()
				.map(this::convertToResponse)
				.collect(Collectors.toList());
	}

	public List<AccidentResponse> getActiveAccidents() {
		List<Accident.IncidentStatus> inactiveStatuses = List.of(Accident.IncidentStatus.RESOLVED, Accident.IncidentStatus.CANCELLED);
		List<AccidentResponse> activeAccidents = accidentRepository.findActiveAccidents(inactiveStatuses).stream()
				.map(this::convertToResponse)
				.collect(Collectors.toList());
		log.info("Found {} active accidents", activeAccidents.size());
		return activeAccidents;
	}

	public void assignAmbulance(Long accidentId, Long ambulanceUserId) {
		Accident accident = accidentRepository.findById(accidentId)
				.orElseThrow(() -> new ResourceNotFoundException("Accident not found"));

		User ambulance = ambulanceUserId != null
				? userRepository.findById(ambulanceUserId)
						.orElseGet(() -> getOrCreateResponder("AMBULANCE", "ambulance", "Road", "Medic", "+911000000"))
				: getOrCreateResponder("AMBULANCE", "ambulance", "Road", "Medic", "+911000000");

		accident.setAmbulanceAssigned(ambulance);
		accident.setStatus(Accident.IncidentStatus.DISPATCHED);
		accident = accidentRepository.save(accident);

		saveEmergencyResponse(accident, ambulance, EmergencyResponse.ResponseType.AMBULANCE, "AMB-101");
		messagingTemplate.convertAndSend("/topic/incidents", convertToResponse(accident));

		log.info("Ambulance {} assigned to accident {}", ambulance.getId(), accidentId);
	}

	public void assignPolice(Long accidentId, Long policeUserId) {
		Accident accident = accidentRepository.findById(accidentId)
				.orElseThrow(() -> new ResourceNotFoundException("Accident not found"));

		User police = policeUserId != null
				? userRepository.findById(policeUserId)
						.orElseGet(() -> getOrCreateResponder("POLICE", "police", "Road", "Guardian", "+911000001"))
				: getOrCreateResponder("POLICE", "police", "Road", "Guardian", "+911000001");

		accident.setPoliceAssigned(police);
		accident.setStatus(Accident.IncidentStatus.DISPATCHED);
		accident = accidentRepository.save(accident);

		saveEmergencyResponse(accident, police, EmergencyResponse.ResponseType.POLICE, "POL-202");
		messagingTemplate.convertAndSend("/topic/incidents", convertToResponse(accident));

		log.info("Police {} assigned to accident {}", police.getId(), accidentId);
	}

	public void assignHospital(Long accidentId, Long hospitalUserId) {
		Accident accident = accidentRepository.findById(accidentId)
				.orElseThrow(() -> new ResourceNotFoundException("Accident not found"));

		User hospital = hospitalUserId != null
				? userRepository.findById(hospitalUserId)
						.orElseGet(() -> getOrCreateResponder("HOSPITAL", "hospital", "City", "Hospital", "+911000002"))
				: getOrCreateResponder("HOSPITAL", "hospital", "City", "Hospital", "+911000002");

		accident.setHospitalAssigned(hospital);
		accident.setStatus(Accident.IncidentStatus.DISPATCHED);
		accident = accidentRepository.save(accident);

		saveEmergencyResponse(accident, hospital, EmergencyResponse.ResponseType.HOSPITAL_COORDINATION, "HOS-303");
		messagingTemplate.convertAndSend("/topic/incidents", convertToResponse(accident));

		log.info("Hospital {} assigned to accident {}", hospital.getId(), accidentId);
	}

	public void deleteAccident(Long accidentId) {
		Accident accident = accidentRepository.findById(accidentId)
				.orElseThrow(() -> new ResourceNotFoundException("Accident not found"));

		accident.setDeleted(true);
		accidentRepository.save(accident);
		log.info("Accident soft-deleted with ID: {}", accidentId);
	}

	private int calculateRiskScore(CreateAccidentRequest request) {
		int score = 0;

		// Severity score
		switch (request.getSeverity().toUpperCase()) {
			case "CRITICAL":
				score += 40;
				break;
			case "HIGH":
				score += 30;
				break;
			case "MODERATE":
				score += 20;
				break;
			case "LOW":
				score += 10;
				break;
		}

		// Casualties score
		if (request.getCasualties() != null) {
			score += Math.min(request.getCasualties() * 5, 30);
		}

		// Traffic density
		if ("HIGH".equalsIgnoreCase(request.getTrafficDensity())) {
			score += 15;
		} else if ("MODERATE".equalsIgnoreCase(request.getTrafficDensity())) {
			score += 10;
		}

		// Weather condition
		if ("RAINY".equalsIgnoreCase(request.getWeatherCondition()) ||
			"FOGGY".equalsIgnoreCase(request.getWeatherCondition())) {
			score += 10;
		}

		return Math.min(score, 100);
	}

	private AccidentResponse convertToResponse(Accident accident) {
		return AccidentResponse.builder()
				.id(accident.getId())
				.title(accident.getTitle())
				.description(accident.getDescription())
				.latitude(accident.getLatitude())
				.longitude(accident.getLongitude())
				.locationName(accident.getLocationName())
				.severity(accident.getSeverity().toString())
				.status(accident.getStatus().toString())
				.riskScore(accident.getRiskScore())
				.casualties(accident.getCasualties())
				.imageUrl(accident.getImageUrl())
				.videoUrl(accident.getVideoUrl())
				.reportedBy(accident.getReportedBy() != null ? convertToUserResponse(accident.getReportedBy()) : null)
				.responseTimeMs(accident.getResponseTimeMs())
				.weatherCondition(accident.getWeatherCondition())
				.trafficDensity(accident.getTrafficDensity())
				.roadType(accident.getRoadType())
				.ambulanceAssigned(accident.getAmbulanceAssigned() != null ? convertToUserResponse(accident.getAmbulanceAssigned()) : null)
				.policeAssigned(accident.getPoliceAssigned() != null ? convertToUserResponse(accident.getPoliceAssigned()) : null)
				.hospitalAssigned(accident.getHospitalAssigned() != null ? convertToUserResponse(accident.getHospitalAssigned()) : null)
				.createdAt(accident.getCreatedAt())
				.updatedAt(accident.getUpdatedAt())
				.build();
	}

	private UserResponse convertToUserResponse(User user) {
		return UserResponse.builder()
				.id(user.getId())
				.firstName(user.getFirstName())
				.lastName(user.getLastName())
				.email(user.getEmail())
				.phone(user.getPhone())
				.role(user.getRole().getName())
				.active(user.getActive())
				.emailVerified(user.getEmailVerified())
				.profileImageUrl(user.getProfileImageUrl())
				.createdAt(user.getCreatedAt())
				.updatedAt(user.getUpdatedAt())
				.build();
	}

	private Role getOrCreateRole(String roleName) {
		return roleRepository.findByName(roleName)
				.orElseGet(() -> roleRepository.save(Role.builder()
						.name(roleName)
						.description(roleName + " responder role")
						.createdAt(LocalDateTime.now())
						.updatedAt(LocalDateTime.now())
						.build()));
	}

	private User getOrCreateResponder(String roleName, String emailPrefix, String firstName, String lastName, String phone) {
		Role role = getOrCreateRole(roleName);
		String email = emailPrefix + "@roadguardian.ai";
		return userRepository.findByEmailAndDeletedFalse(email)
				.orElseGet(() -> {
					try {
						return userRepository.saveAndFlush(User.builder()
								.firstName(firstName)
								.lastName(lastName)
								.email(email)
								.password(passwordEncoder.encode("RoadGuardian123!"))
								.phone(phone)
								.role(role)
								.active(true)
								.emailVerified(true)
								.profileImageUrl(null)
								.latitude(0.0)
								.longitude(0.0)
								.build());
					} catch (Exception e) {
						// Concurrent insert — re-query
						return userRepository.findByEmailAndDeletedFalse(email)
								.orElseThrow(() -> new RuntimeException("Failed to get responder: " + email));
					}
				});
	}

	private void saveEmergencyResponse(Accident accident, User responder, EmergencyResponse.ResponseType type, String vehicleRegistration) {
		EmergencyResponse emergencyResponse = EmergencyResponse.builder()
				.accident(accident)
				.responder(responder)
				.responseType(type)
				.status(EmergencyResponse.ResponseStatus.DISPATCHED)
				.etaMinutes(5)
				.currentLatitude(accident.getLatitude())
				.currentLongitude(accident.getLongitude())
				.vehicleRegistration(vehicleRegistration)
				.notes("Auto-dispatched by RoadGuardian")
				.build();
		emergencyResponseRepository.save(emergencyResponse);
	}

	private User getOrCreateAnonymousReporter() {
		return userRepository.findByEmailAndDeletedFalse("anonymous@roadguardian.ai")
				.orElseGet(() -> {
					Role userRole = getOrCreateRole("USER");

					User anonymous = User.builder()
						.firstName("Anonymous")
						.lastName("Reporter")
						.email("anonymous@roadguardian.ai")
						.password(passwordEncoder.encode("RoadGuardian123!"))
						.phone("+919999999999")
						.role(userRole)
						.active(true)
						.emailVerified(true)
						.build();

					return userRepository.save(anonymous);
				});
	}
}
