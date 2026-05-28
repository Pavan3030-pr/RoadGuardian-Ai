package com.roadguardian;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * RoadGuardian AI Backend - Production-grade emergency response platform
 * Main Spring Boot application entry point
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
@ComponentScan(basePackages = "com.roadguardian")
@OpenAPIDefinition(
    info = @Info(
        title = "RoadGuardian AI API",
        version = "1.0.0",
        description = "Production-grade AI-powered emergency response and accident monitoring backend for smart cities",
        contact = @Contact(name = "RoadGuardian Team", email = "team@roadguardian.com"),
        license = @License(name = "MIT License")
    ),
    servers = {
        @Server(url = "http://localhost:8080", description = "Development Server"),
        @Server(url = "https://api.roadguardian.com", description = "Production Server")
    }
)
public class RoadGuardianBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(RoadGuardianBackendApplication.class, args);
    }
}
