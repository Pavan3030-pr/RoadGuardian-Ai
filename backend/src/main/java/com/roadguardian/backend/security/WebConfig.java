package com.roadguardian.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class WebConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow credentials like cookies or auth headers
        config.setAllowCredentials(true);
        
        // Whitelist both local dev and your live production Vercel apps
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "https://vercel.app"
        ));
        
        // Explicitly authorize all communication methods
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Allow all standard secure token request headers
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));
        
        // Apply this global policy routing across all your /api endpoints
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
