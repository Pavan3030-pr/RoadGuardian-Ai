package com.roadguardian.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.roadguardian.backend.model.entity.User;
import com.roadguardian.backend.model.entity.Role;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmailAndDeletedFalse(String email);

	Optional<User> findByPhoneAndDeletedFalse(String phone);

	List<User> findByRoleAndDeletedFalse(Role role);

	List<User> findByActiveAndDeletedFalse(Boolean active);

	Long countByActiveAndDeletedFalse(Boolean active);

	List<User> findByRoleAndActiveAndDeletedFalse(Role role, Boolean active);

	@Query(value = "SELECT * FROM users u WHERE u.deleted = false AND (6371 * acos(cos(radians(:latitude)) * cos(radians(u.latitude)) * cos(radians(u.longitude) - radians(:longitude)) + sin(radians(:latitude)) * sin(radians(u.latitude)))) <= :radiusKm",
			nativeQuery = true)
	List<User> findNearbyUsers(@Param("latitude") Double latitude, @Param("longitude") Double longitude, @Param("radiusKm") Double radiusKm);

	boolean existsByEmailAndDeletedFalse(String email);

	boolean existsByPhoneAndDeletedFalse(String phone);
}
