package com.roadguardian.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health", description = "Health check endpoints")
public class HealthController {

	@GetMapping
	@Operation(summary = "Health check", description = "Check if service is running")
	public ResponseEntity<HealthResponse> health() {
		return ResponseEntity.ok(new HealthResponse("UP", "RoadGuardian Backend is operational"));
	}

	@GetMapping("/ready")
	@Operation(summary = "Readiness check", description = "Check if service is ready for traffic")
	public ResponseEntity<HealthResponse> readiness() {
		return ResponseEntity.ok(new HealthResponse("READY", "Service is ready"));
	}

	public static class HealthResponse {
		private String status;
		private String message;

		public HealthResponse() {
		}

		public HealthResponse(String status, String message) {
			this.status = status;
			this.message = message;
		}

		public String getStatus() {
			return status;
		}

		public void setStatus(String status) {
			this.status = status;
		}

		public String getMessage() {
			return message;
		}

		public void setMessage(String message) {
			this.message = message;
		}
	}
}
