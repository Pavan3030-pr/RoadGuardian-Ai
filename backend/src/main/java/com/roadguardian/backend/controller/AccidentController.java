package com.roadguardian.backend.controller;

import com.roadguardian.backend.exception.InvalidRequestException;
import com.roadguardian.backend.model.dto.request.CreateAccidentRequest;
import com.roadguardian.backend.model.dto.request.UpdateAccidentRequest;
import com.roadguardian.backend.model.dto.response.AccidentResponse;
import com.roadguardian.backend.model.dto.response.ApiResponse;
import com.roadguardian.backend.security.CustomUserDetails;
import com.roadguardian.backend.service.AccidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accidents")
@Tag(name = "Accidents", description = "Accident management endpoints")
public class AccidentController {

	private final AccidentService accidentService;

	public AccidentController(AccidentService accidentService) {
		this.accidentService = accidentService;
	}

	@PostMapping
	@PreAuthorize("hasAnyRole('USER', 'ADMIN', 'POLICE')")
	@Operation(summary = "Report new accident", description = "Create a new accident report")
	public ResponseEntity<ApiResponse<AccidentResponse>> createAccident(
			@Valid @RequestBody CreateAccidentRequest request,
			Authentication authentication
	) {
		Long userId = extractUserIdFromAuth(authentication);
		AccidentResponse response = accidentService.createAccident(request, userId);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse<>(true, "Accident reported successfully", response));
	}

	@PostMapping("/public")
	@Operation(summary = "Report new accident (public)", description = "Create a new accident report without authentication")
	public ResponseEntity<ApiResponse<AccidentResponse>> createPublicAccident(
			@Valid @RequestBody CreateAccidentRequest request
	) {
		AccidentResponse response = accidentService.createAccident(request, null);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse<>(true, "Public accident reported successfully", response));
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get accident details", description = "Fetch accident information by ID")
	public ResponseEntity<ApiResponse<AccidentResponse>> getAccident(@PathVariable Long id) {
		AccidentResponse response = accidentService.getAccidentById(id);
		return ResponseEntity.ok(new ApiResponse<>(true, "Accident fetched successfully", response));
	}

	@GetMapping
	@Operation(summary = "Get all accidents", description = "Fetch paginated list of accidents")
	public ResponseEntity<ApiResponse<Page<AccidentResponse>>> getAllAccidents(
			@RequestParam(defaultValue = "0") int pageNumber,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(defaultValue = "createdAt") String sortBy,
			@RequestParam(defaultValue = "DESC") String sortDirection
	) {
		Page<AccidentResponse> response = accidentService.getAccidentsPaginated(pageNumber, pageSize, sortBy, sortDirection);
		return ResponseEntity.ok(new ApiResponse<>(true, "Accidents fetched successfully", response));
	}

	@GetMapping("/severity/{severity}")
	@Operation(summary = "Get accidents by severity", description = "Filter accidents by severity level")
	public ResponseEntity<ApiResponse<List<AccidentResponse>>> getBySeverity(@PathVariable String severity) {
		List<AccidentResponse> response = accidentService.getAccidentsBySeverity(severity);
		return ResponseEntity.ok(new ApiResponse<>(true, "Accidents filtered by severity", response));
	}

	@GetMapping("/status/{status}")
	@Operation(summary = "Get accidents by status", description = "Filter accidents by status")
	public ResponseEntity<ApiResponse<List<AccidentResponse>>> getByStatus(@PathVariable String status) {
		List<AccidentResponse> response = accidentService.getAccidentsByStatus(status);
		return ResponseEntity.ok(new ApiResponse<>(true, "Accidents filtered by status", response));
	}

	@GetMapping("/nearby")
	@Operation(summary = "Find nearby accidents", description = "Get accidents near coordinates")
	public ResponseEntity<ApiResponse<List<AccidentResponse>>> getNearbyAccidents(
			@RequestParam Double latitude,
			@RequestParam Double longitude,
			@RequestParam(defaultValue = "5") Double radiusKm
	) {
		List<AccidentResponse> response = accidentService.getNearbyAccidents(latitude, longitude, radiusKm);
		return ResponseEntity.ok(new ApiResponse<>(true, "Nearby accidents fetched", response));
	}

	@GetMapping("/active")
	@Operation(summary = "Get active accidents", description = "Fetch all active (unresolved) accidents")
	public ResponseEntity<ApiResponse<List<AccidentResponse>>> getActiveAccidents() {
		List<AccidentResponse> response = accidentService.getActiveAccidents();
		return ResponseEntity.ok(new ApiResponse<>(true, "Active accidents fetched", response));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'POLICE')")
	@Operation(summary = "Update accident", description = "Update accident details")
	public ResponseEntity<ApiResponse<AccidentResponse>> updateAccident(
			@PathVariable Long id,
			@Valid @RequestBody UpdateAccidentRequest request
	) {
		AccidentResponse response = accidentService.updateAccident(id, request);
		return ResponseEntity.ok(new ApiResponse<>(true, "Accident updated successfully", response));
	}

	@PostMapping("/{id}/ambulance")
	@PreAuthorize("isAuthenticated()")
	@Operation(summary = "Dispatch ambulance", description = "Dispatch ambulance for accident")
	public ResponseEntity<ApiResponse<String>> dispatchAmbulance(
			@PathVariable Long id,
			@RequestParam(required = false) Long ambulanceUserId
	) {
		accidentService.assignAmbulance(id, ambulanceUserId);
		return ResponseEntity.ok(new ApiResponse<>(true, "Ambulance dispatched successfully", ""));
	}

	@PostMapping("/{id}/police")
	@PreAuthorize("isAuthenticated()")
	@Operation(summary = "Notify police", description = "Notify local police for accident")
	public ResponseEntity<ApiResponse<String>> notifyPolice(
			@PathVariable Long id,
			@RequestParam(required = false) Long policeUserId
		) {
		accidentService.assignPolice(id, policeUserId);
		return ResponseEntity.ok(new ApiResponse<>(true, "Police notified successfully", ""));
	}

	@PostMapping("/{id}/hospital")
	@PreAuthorize("isAuthenticated()")
	@Operation(summary = "Notify hospital", description = "Notify hospital for accident")
	public ResponseEntity<ApiResponse<String>> notifyHospital(
			@PathVariable Long id,
			@RequestParam(required = false) Long hospitalUserId
	) {
		accidentService.assignHospital(id, hospitalUserId);
		return ResponseEntity.ok(new ApiResponse<>(true, "Hospital notified successfully", ""));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	@Operation(summary = "Delete accident", description = "Remove accident record (admin only)")
	public ResponseEntity<ApiResponse<String>> deleteAccident(@PathVariable Long id) {
		accidentService.deleteAccident(id);
		return ResponseEntity.ok(new ApiResponse<>(true, "Accident deleted successfully", ""));
	}

	private Long extractUserIdFromAuth(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			throw new InvalidRequestException("Authentication required");
		}
		Object principal = authentication.getPrincipal();
		if (principal instanceof CustomUserDetails) {
			CustomUserDetails details = (CustomUserDetails) principal;
			return details.getUserId();
		}
		// Fallback for tests or unexpected principal types
		return 1L;
	}
}
