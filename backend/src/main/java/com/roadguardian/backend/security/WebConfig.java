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
        
        config.setAllowCredentials(true);
        
        // ✅ Switch to Origin Patterns to whitelist your specific project domain + subdomains
        config.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:5173",
            "https://road-guardian-ai.vercel.app",  // Your main production deployment
            "https://*.vercel.app"                  // Wildcard to trust all your preview URLs
        ));
        
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
