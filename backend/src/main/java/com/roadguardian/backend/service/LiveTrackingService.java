package com.roadguardian.backend.service;

import com.roadguardian.backend.model.dto.response.LiveTrackingResponse;

import java.util.List;

public interface LiveTrackingService {

	LiveTrackingResponse updateLocation(Long userId, Long accidentId, Double latitude, Double longitude, String status);

	LiveTrackingResponse getLocationForUser(Long userId);

	List<LiveTrackingResponse> getNearbyResources(Double latitude, Double longitude, Double radiusKm, String resourceType);

	List<LiveTrackingResponse> getAllActiveTracking();

	void stopTracking(Long userId);
}
