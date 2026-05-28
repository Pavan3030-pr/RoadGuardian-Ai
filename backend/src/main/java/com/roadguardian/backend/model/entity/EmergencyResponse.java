package com.roadguardian.backend.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_responses", indexes = {
	@Index(name = "idx_emergency_responses_accident_id", columnList = "accident_id"),
	@Index(name = "idx_emergency_responses_responder_id", columnList = "responder_id"),
	@Index(name = "idx_emergency_responses_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accident_id", nullable = false)
    private Accident accident;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responder_id", nullable = false)
    private User responder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResponseType responseType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResponseStatus status;

    @Column(name = "eta_minutes")
    private Integer etaMinutes;

    @Column(nullable = false, columnDefinition = "DOUBLE PRECISION")
    private Double currentLatitude;

    @Column(nullable = false, columnDefinition = "DOUBLE PRECISION")
    private Double currentLongitude;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "arrived_at")
    private LocalDateTime arrivedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "vehicle_registration", length = 50)
    private String vehicleRegistration;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum ResponseType {
        AMBULANCE, POLICE, FIRE, HOSPITAL_COORDINATION, DISPATCHER
    }

    public enum ResponseStatus {
        PENDING, DISPATCHED, ACCEPTED, EN_ROUTE, ARRIVED, COMPLETED, CANCELLED
    }
}
