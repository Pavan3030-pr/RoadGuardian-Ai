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
@Table(name = "live_tracking", indexes = {
	@Index(name = "idx_live_tracking_user_id", columnList = "user_id"),
	@Index(name = "idx_live_tracking_accident_id", columnList = "accident_id"),
	@Index(name = "idx_live_tracking_updated_at", columnList = "last_updated")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiveTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accident_id")
    private Accident accident;

    @Column(nullable = false, columnDefinition = "DOUBLE PRECISION")
    private Double latitude;

    @Column(nullable = false, columnDefinition = "DOUBLE PRECISION")
    private Double longitude;

    private String status;

    private Double speed;

    private String direction;

    @UpdateTimestamp
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
