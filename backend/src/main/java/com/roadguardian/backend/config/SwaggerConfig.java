package com.roadguardian.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

	@Bean
	public OpenAPI customOpenAPI() {
		return new OpenAPI()
				.info(new Info()
						.title("RoadGuardian AI Backend API")
						.version("1.0.0")
						.description("Production-grade AI-powered emergency response and accident monitoring platform")
						.contact(new Contact()
								.name("RoadGuardian Team")
								.url("https://github.com/roadguardian"))
						.license(new License()
								.name("MIT License")
								.url("https://opensource.org/licenses/MIT")))
				.addSecurityItem(new SecurityRequirement().addList("Bearer Token"))
				.components(new Components()
						.addSecuritySchemes("Bearer Token", new SecurityScheme()
								.type(SecurityScheme.Type.HTTP)
								.scheme("bearer")
								.bearerFormat("JWT")
								.description("JWT token for API authentication")));
	}
}
