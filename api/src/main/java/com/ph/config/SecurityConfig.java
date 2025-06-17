package com.ph.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    /**
     * Configures the security filter chain, including CORS and CSRF settings,
     * as well as authorization rules for endpoints.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Enable CORS using the configuration defined in corsConfigurationSource()
                .cors(Customizer.withDefaults())
                // Disable CSRF protection to simplify REST API development.
                // For production, consider enabling CSRF with proper configuration.
                .csrf(AbstractHttpConfigurer::disable)
                // Configure authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Allow unauthenticated POST requests to /auth/login (login endpoint)
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                        // Require authentication for all other requests
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    /**
     * Defines CORS configuration to allow requests from the Angular frontend during development.
     * - Allows only the origin 'http://localhost:4200'.
     * - Allows common HTTP methods.
     * - Allows all headers.
     * - Allows credentials (cookies, authorization headers).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this CORS configuration to all paths
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
