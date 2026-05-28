package com.roadguardian.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.roadguardian.backend.model.dto.request.LoginRequest;
import com.roadguardian.backend.model.dto.request.RegisterRequest;
import com.roadguardian.backend.model.dto.response.JwtAuthResponse;
import com.roadguardian.backend.model.dto.response.ApiResponse;
import com.roadguardian.backend.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication endpoints")
public class AuthController {

	private final AuthService authService;

	@PostMapping("/login")
	@Operation(summary = "User login", description = "Authenticate user and get JWT token")
	public ResponseEntity<ApiResponse<JwtAuthResponse>> login(@Valid @RequestBody LoginRequest request) {
		JwtAuthResponse response = authService.login(request);
		return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", response));
	}

	@PostMapping("/register")
	@Operation(summary = "User registration", description = "Register new user")
	public ResponseEntity<ApiResponse<JwtAuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
		JwtAuthResponse response = authService.register(request);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse<>(true, "Registration successful", response));
	}

	@PostMapping("/refresh-token")
	@Operation(summary = "Refresh access token", description = "Get new access token using refresh token")
	public ResponseEntity<ApiResponse<JwtAuthResponse>> refreshToken(@RequestParam String refreshToken) {
		JwtAuthResponse response = authService.refreshToken(refreshToken);
		return ResponseEntity.ok(new ApiResponse<>(true, "Token refreshed successfully", response));
	}

	@PostMapping("/logout")
	@Operation(summary = "User logout", description = "Logout user and revoke tokens")
	public ResponseEntity<ApiResponse<String>> logout() {
		authService.logout(authService.getCurrentUser().getId());
		return ResponseEntity.ok(new ApiResponse<>(true, "Logout successful", ""));
	}

	@GetMapping("/me")
	@Operation(summary = "Get current user", description = "Fetch current logged-in user details")
	public ResponseEntity<ApiResponse<Object>> getCurrentUser() {
		return ResponseEntity.ok(new ApiResponse<>(true, "Current user fetched", authService.getCurrentUser()));
	}
}
