package com.roadguardian.backend.controller;

import com.roadguardian.backend.model.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/geocode")
@RequiredArgsConstructor
@Tag(name = "Geocoding", description = "Address geocoding endpoints")
public class GeocodingController {

	private final RestTemplate restTemplate = new RestTemplate();

	@GetMapping("/search")
	@Operation(summary = "Search address coordinates")
	public ResponseEntity<ApiResponse<List<Map<String, Object>>>> search(@RequestParam String query) {
		if (query == null || query.trim().length() < 3) {
			return ResponseEntity.ok(new ApiResponse<>(true, "No geocoding results", Collections.emptyList()));
		}

		String url = UriComponentsBuilder.fromUriString("https://nominatim.openstreetmap.org/search")
				.queryParam("format", "json")
				.queryParam("addressdetails", "1")
				.queryParam("limit", "5")
				.queryParam("q", query.trim())
				.build()
				.encode()
				.toUriString();

		try {
			List<Map<String, Object>> results = restTemplate.getForObject(url, List.class);
			return ResponseEntity.ok(new ApiResponse<>(true, "Geocoding results fetched", results == null ? Collections.emptyList() : results));
		} catch (RestClientException ex) {
			return ResponseEntity.ok(new ApiResponse<>(true, "Geocoding unavailable", Collections.emptyList()));
		}
	}
}
