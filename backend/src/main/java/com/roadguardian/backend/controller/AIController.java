package com.roadguardian.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.roadguardian.backend.model.dto.AIRiskRecommendationDTO;
import com.roadguardian.backend.model.dto.response.ApiResponse;
import com.roadguardian.backend.service.AIRiskEngineService;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Engine", description = "AI-powered risk and recommendation endpoints")
public class AIController {

	private final AIRiskEngineService aiRiskEngineService;

	@PostMapping("/recommend/{accidentId}")
	@Operation(summary = "Get AI recommendations")
	public ResponseEntity<ApiResponse<AIRiskRecommendationDTO>> getRecommendations(@PathVariable Long accidentId) {
		return ResponseEntity.ok(new ApiResponse<>(true, "AI recommendations generated", aiRiskEngineService.generateRecommendations(accidentId)));
	}

	@PostMapping("/analyze-image")
	@Operation(summary = "Analyze image for accident detection")
	public ResponseEntity<ApiResponse<AIRiskRecommendationDTO>> analyzeImage(@RequestParam("file") MultipartFile file) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Image analyzed", aiRiskEngineService.analyzeImage(file)));
	}
}
