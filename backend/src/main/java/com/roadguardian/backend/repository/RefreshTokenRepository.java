package com.roadguardian.backend.repository;

import com.roadguardian.backend.model.entity.RefreshToken;
import com.roadguardian.backend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByUser(User user);

    void deleteByToken(String token);

    void deleteByUserAndRevokedTrue(User user);

    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
