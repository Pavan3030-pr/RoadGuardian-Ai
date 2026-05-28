package com.roadguardian.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roadguardian.backend.model.dto.request.CreateAccidentRequest;
import com.roadguardian.backend.model.dto.response.AccidentResponse;
import com.roadguardian.backend.service.AccidentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AccidentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AccidentService accidentService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "USER")
    void testCreateAccident() throws Exception {
        CreateAccidentRequest request = CreateAccidentRequest.builder()
                .title("Test Accident")
                .locationName("Test Location")
                .latitude(10.0)
                .longitude(20.0)
                .severity("HIGH")
                .build();

        AccidentResponse response = AccidentResponse.builder()
                .id(1L)
                .title("Test Accident")
                .build();

        when(accidentService.createAccident(any(CreateAccidentRequest.class), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/accidents")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Test Accident"));
    }
}
