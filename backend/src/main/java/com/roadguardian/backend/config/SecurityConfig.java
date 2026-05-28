package com.roadguardian.backend.config;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.roadguardian.backend.security.JwtTokenProvider;
import com.roadguardian.backend.security.JwtAuthenticationFilter;

import javax.crypto.SecretKey;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

	@Value("${app.jwt.secret:mySecretKeyForJWTTokenGenerationAndValidationPurpose123456789}")
	private String jwtSecret;

	@Value("${app.jwt.expiration:86400000}")
	private long jwtExpirationMs;

	@Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,https://roadguardian.com,https://*.vercel.app,https://*.render.com}")
	private String corsAllowedOrigins;

	@Value("${app.cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS,PATCH}")
	private String corsAllowedMethods;

	@Value("${app.cors.allowed-headers:*}")
	private String corsAllowedHeaders;

	@Value("${app.cors.allow-credentials:true}")
	private boolean corsAllowCredentials;

	@Value("${app.cors.max-age:3600}")
	private long corsMaxAge;

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public SecretKey jwtSecretKey() {
		return Keys.hmacShaKeyFor(jwtSecret.getBytes());
	}

	@Bean
	public JwtTokenProvider jwtTokenProvider() {
		return new JwtTokenProvider(jwtSecretKey(), jwtExpirationMs);
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
		return authenticationConfiguration.getAuthenticationManager();
	}

	@Bean
	public SecurityFilterChain filterChain(
			HttpSecurity http,
			JwtTokenProvider jwtTokenProvider,
			JwtAuthenticationFilter jwtAuthenticationFilter
	) throws Exception {
		http
				.csrf(csrf -> csrf.disable())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(authz -> authz
						.requestMatchers("/api/v1/auth/**").permitAll()
						.requestMatchers("/api/v1/health/**").permitAll()
						.requestMatchers("/actuator/**").permitAll()
						.requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/v1/accidents/public").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/v1/accidents/demo").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/v1/accidents/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/v1/analytics/**").hasAnyRole("ADMIN", "POLICE", "HOSPITAL")
						.requestMatchers("/ws/**").permitAll()
						.anyRequest().authenticated()
				)
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
				.cors(cors -> cors.configurationSource(corsConfigurationSource()));

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		List<String> allowedOrigins = Arrays.stream(corsAllowedOrigins.split(","))
				.map(String::trim)
				.filter(origin -> !origin.isEmpty())
				.collect(Collectors.toList());

		List<String> allowedMethods = Arrays.stream(corsAllowedMethods.split(","))
				.map(String::trim)
				.filter(method -> !method.isEmpty())
				.collect(Collectors.toList());

		List<String> allowedHeaders = Arrays.stream(corsAllowedHeaders.split(","))
				.map(String::trim)
				.filter(header -> !header.isEmpty())
				.collect(Collectors.toList());

		configuration.setAllowedOriginPatterns(allowedOrigins);
		configuration.setAllowedMethods(allowedMethods);
		configuration.setAllowedHeaders(allowedHeaders);
		configuration.setAllowCredentials(corsAllowCredentials);
		configuration.setMaxAge(corsMaxAge);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}
