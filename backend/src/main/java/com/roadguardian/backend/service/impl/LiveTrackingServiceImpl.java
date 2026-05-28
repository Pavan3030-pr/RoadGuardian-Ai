package com.roadguardian.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.roadguardian.backend.exception.ResourceNotFoundException;
import com.roadguardian.backend.model.dto.response.LiveTrackingResponse;
import com.roadguardian.backend.model.entity.LiveTracking;
import com.roadguardian.backend.model.entity.User;
import com.roadguardian.backend.model.entity.Accident;
import com.roadguardian.backend.repository.AccidentRepository;
import com.roadguardian.backend.repository.LiveTrackingRepository;
import com.roadguardian.backend.repository.UserRepository;
import com.roadguardian.backend.service.LiveTrackingService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LiveTrackingServiceImpl implements LiveTrackingService {

	private final LiveTrackingRepository liveTrackingRepository;
	private final UserRepository userRepository;
	private final AccidentRepository accidentRepository;

	public LiveTrackingResponse updateLocation(Long userId, Long accidentId, Double latitude, Double longitude, String status) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		Accident accident = accidentRepository.findById(accidentId)
				.orElseThrow(() -> new ResourceNotFoundException("Accident not found"));

		LiveTracking tracking = liveTrackingRepository.findTopByUser_IdOrderByLastUpdatedDesc(userId)
				.orElse(null);

		if (tracking == null) {
			tracking = LiveTracking.builder()
					.user(user)
					.accident(accident)
					.latitude(latitude)
					.longitude(longitude)
					.speed(0.0)
					.status(status)
					.lastUpdated(LocalDateTime.now())
					.build();
		} else {
			tracking.setLatitude(latitude);
			tracking.setLongitude(longitude);
			tracking.setStatus(status);
			tracking.setLastUpdated(LocalDateTime.now());
		}

		tracking = liveTrackingRepository.save(tracking);
		log.debug("Location updated for user: {}", userId);

		return convertToResponse(tracking);
	}

	public LiveTrackingResponse getLocationForUser(Long userId) {
		LiveTracking tracking = liveTrackingRepository.findTopByUser_IdOrderByLastUpdatedDesc(userId)
				.orElseThrow(() -> new ResourceNotFoundException("No tracking data found for user"));

		return convertToResponse(tracking);
	}

	public List<LiveTrackingResponse> getNearbyResources(Double latitude, Double longitude, Double radiusKm, String resourceType) {
		// This would need a custom query to find resources within a radius
		// For now, returning all active tracking data
		return liveTrackingRepository.findAll().stream()
				.filter(tracking -> isWithinRadius(tracking.getLatitude(), tracking.getLongitude(), latitude, longitude, radiusKm))
				.map(this::convertToResponse)
				.collect(Collectors.toList());
	}

	public List<LiveTrackingResponse> getAllActiveTracking() {
		return liveTrackingRepository.findAll().stream()
				.map(this::convertToResponse)
				.collect(Collectors.toList());
	}

	public void stopTracking(Long userId) {
		LiveTracking tracking = liveTrackingRepository.findTopByUser_IdOrderByLastUpdatedDesc(userId)
				.orElse(null);

		if (tracking != null) {
			tracking.setStatus("INACTIVE");
			liveTrackingRepository.save(tracking);
			log.info("Tracking stopped for user: {}", userId);
		}
	}

	private boolean isWithinRadius(Double lat1, Double lon1, Double lat2, Double lon2, Double radiusKm) {
		double earthRadiusKm = 6371;

		double dLat = Math.toRadians(lat2 - lat1);
		double dLon = Math.toRadians(lon2 - lon1);

		double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
				Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
						Math.sin(dLon / 2) * Math.sin(dLon / 2);

		double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		double distance = earthRadiusKm * c;

		return distance <= radiusKm;
	}

	private LiveTrackingResponse convertToResponse(LiveTracking tracking) {
		return LiveTrackingResponse.builder()
				.id(tracking.getId())
				.userId(tracking.getUser().getId())
				.userName(tracking.getUser().getFirstName() + " " + tracking.getUser().getLastName())
				.latitude(tracking.getLatitude())
				.longitude(tracking.getLongitude())
				.status(tracking.getStatus())
				.lastUpdated(tracking.getLastUpdated())
				.build();
	}
}
