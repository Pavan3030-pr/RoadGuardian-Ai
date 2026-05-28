package com.roadguardian.backend.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.roadguardian.backend.model.entity.User;
import com.roadguardian.backend.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;

	public CustomUserDetailsService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		User user = userRepository.findByEmailAndDeletedFalse(email)
				.orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

		return new CustomUserDetails(user);
	}

	public UserDetails loadUserById(Long id) {
		User user = userRepository.findById(id)
				.filter(u -> u.getDeleted() == null || !u.getDeleted())
				.orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

		return new CustomUserDetails(user);
	}
}
