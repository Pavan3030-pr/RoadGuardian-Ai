package com.roadguardian.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens", indexes = {
	@Index(name = "idx_refresh_tokens_token", columnList = "token", unique = true),
	@Index(name = "idx_refresh_tokens_user_id", columnList = "user_id"),
	@Index(name = "idx_refresh_tokens_expires_at", columnList = "expires_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, columnDefinition = "TEXT")
	private String token;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false)
	private LocalDateTime expiresAt;

	@Column(nullable = false)
	private LocalDateTime createdAt;

	private LocalDateTime revokedAt;

	@Column(nullable = false)
	private Boolean revoked = false;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
	}

	public boolean isExpired() {
		return LocalDateTime.now().isAfter(expiresAt);
	}

	public boolean isValid() {
		return !revoked && !isExpired();
	}
}
