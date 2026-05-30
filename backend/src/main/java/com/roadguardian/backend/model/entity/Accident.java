package com.roadguardian.backend.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "accidents", indexes = {
	@Index(name = "idx_accidents_severity", columnList = "severity"),
	@Index(name = "idx_accidents_status", columnList = "status"),
	@Index(name = "idx_accidents_created_at", columnList = "created_at"),
	@Index(name = "idx_accidents_location", columnList = "latitude,longitude")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Accident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, columnDefinition = "NUMERIC")
    private Double latitude;

    @Column(nullable = false, columnDefinition = "NUMERIC")
    private Double longitude;

    @Column(name = "location_name", nullable = false)
    private String locationName;

    private String area;

    private String street;

    private String village;

    private String district;

    private String state;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeverityLevel severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentStatus status;

    @Column(name = "risk_score", nullable = false)
    private Integer riskScore;

    private Integer casualties;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_id", nullable = false)
    private User reportedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ambulance_assigned_id")
    private User ambulanceAssigned;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "police_assigned_id")
    private User policeAssigned;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_assigned_id")
    private User hospitalAssigned;

    @Column(name = "response_time_ms")
    private Long responseTimeMs;

    @Column(name = "weather_condition", length = 50)
    private String weatherCondition;

    @Column(name = "traffic_density", length = 50)
    private String trafficDensity;

    @Column(name = "road_type", length = 50)
    private String roadType;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean deleted = false;

    public enum SeverityLevel {
        LOW, MODERATE, HIGH, CRITICAL
    }

    public enum IncidentStatus {
        ACCIDENT_DETECTED,
        AI_VERIFIED,
        AMBULANCE_ASSIGNED,
        POLICE_ASSIGNED,
        HOSPITAL_ALERTED,
        AMBULANCE_ARRIVED,
        PATIENT_PICKED,
        REACHED_HOSPITAL,
        CASE_CLOSED,
        REPORTED,
        ACKNOWLEDGED,
        IN_PROGRESS,
        DISPATCHED,
        ESCALATED,
        RESOLVED,
        CANCELLED
    }

    public enum WeatherCondition {
        CLEAR, RAINY, FOGGY, STORMY, SNOWY
    }

    public enum TrafficDensity {
        LOW, MODERATE, HIGH, VERY_HIGH
    }

    public enum RoadType {
        HIGHWAY, CITY, RURAL, ARTERIAL
    }
}
