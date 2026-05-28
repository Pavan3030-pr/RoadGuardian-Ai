package com.roadguardian.backend.service;

import com.roadguardian.backend.model.dto.AIRiskRecommendationDTO;
import com.roadguardian.backend.model.entity.AIRecommendation;
import com.roadguardian.backend.model.entity.Accident;
import com.roadguardian.backend.repository.AIRecommendationRepository;
import com.roadguardian.backend.repository.AccidentRepository;
import com.roadguardian.backend.service.impl.AIRiskEngineServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AIRiskEngineServiceTest {

    @Mock
    private AIRecommendationRepository aiRecommendationRepository;

    @Mock
    private AccidentRepository accidentRepository;

    @Mock
    private AnalyticsService analyticsService;

    @InjectMocks
    private AIRiskEngineServiceImpl aiRiskEngineService;

    private Accident accident;

    @BeforeEach
    void setUp() {
        accident = Accident.builder()
                .id(1L)
                .severity(Accident.SeverityLevel.HIGH)
                .casualties(2)
                .riskScore(75)
                .build();
    }

    @Test
    void testCalculateRiskScore() {
        Integer score = aiRiskEngineService.calculateRiskScore("HIGH", 2);
        assertNotNull(score);
        assertTrue(score >= 70 && score <= 100);
    }

    @Test
    void testGenerateRecommendations() {
        when(accidentRepository.findById(1L)).thenReturn(Optional.of(accident));
        when(aiRecommendationRepository.save(any(AIRecommendation.class))).thenAnswer(i -> i.getArguments()[0]);

        AIRiskRecommendationDTO dto = aiRiskEngineService.generateRecommendations(1L);

        assertNotNull(dto);
        assertEquals(1L, dto.getAccidentId());
        assertNotNull(dto.getAmbulanceNeeded());
        assertNotNull(dto.getHospitalRequired());
    }
}
