package com.roadguardian.backend.config;

import com.roadguardian.backend.model.entity.Role;
import com.roadguardian.backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class RoleDataInitializer implements ApplicationRunner {

	private static final Map<String, String> DEFAULT_ROLES = Map.of(
			"ADMIN", "System administrator with full access",
			"USER", "Regular user who can report accidents",
			"POLICE", "Police officer for emergency response",
			"HOSPITAL", "Hospital staff for medical response",
			"AMBULANCE", "Ambulance driver for emergency response"
	);

	private final RoleRepository roleRepository;

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		DEFAULT_ROLES.forEach((name, description) -> {
			if (!roleRepository.existsByName(name)) {
				roleRepository.save(Role.builder()
						.name(name)
						.description(description)
						.build());
			}
		});
	}
}
