package com.ph.controllers;

import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import com.ph.services.AuthService;

import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.util.Map;

/**
 * Authentication controller.
 * - POST /auth/login: username/password login -> sets HttpOnly cookie + returns access_token
 * - POST /auth/logout: clears cookie
 * - POST /auth/magic: forwards magic-link request to AuthService (optionally accepts redirect_to)
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody(required = false) LoginDto dto, HttpServletResponse response) {
        if (dto == null || isBlank(dto.getEmail()) || isBlank(dto.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and password are required"));
        }

        try {
            String email = dto.getEmail().trim().toLowerCase();
            String jwt = authService.authenticate(email, dto.getPassword());

            ResponseCookie cookie = ResponseCookie.from("tm_token", jwt)
                    .httpOnly(true)
                    .secure(false) // set to true in production with HTTPS
                    .path("/")
                    .maxAge(Duration.ofHours(1))
                    .sameSite("Lax")
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            return ResponseEntity.ok(Map.of("access_token", jwt));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid request", "message", ex.getMessage()));
        } catch (Exception ex) {
            log.error("Unexpected error during login", ex);
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("tm_token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(Duration.ZERO)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    /**
     * Endpoint to request a Supabase magic link.
     * Accepts JSON body: { "email": "...", "redirect_to": "https://..." } (redirect_to optional).
     * The controller forwards to AuthService; AuthService should forward redirect_to to Supabase if provided.
     */
    @PostMapping("/magic")
    public ResponseEntity<?> sendMagicLink(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (isBlank(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        String redirectTo = body.get("redirect_to"); // optional

        try {
            if (redirectTo != null && !redirectTo.trim().isEmpty()) {
                // forward with redirect if AuthService supports it
                try {
                    authService.sendMagicLink(email.trim().toLowerCase(), redirectTo.trim());
                } catch (NoSuchMethodError | AbstractMethodError e) {
                    // fallback if AuthService does not have the overload:
                    log.warn("AuthService does not expose sendMagicLink(email, redirectTo); falling back to sendMagicLink(email)");
                    authService.sendMagicLink(email.trim().toLowerCase());
                }
            } else {
                authService.sendMagicLink(email.trim().toLowerCase());
            }
            return ResponseEntity.ok(Map.of("message", "Magic link sent"));
        } catch (Exception ex) {
            log.error("Magic link login failed for email {}", email, ex);
            String msg = ex.getMessage() != null ? ex.getMessage() : "Magic link login failed";
            return ResponseEntity.status(500).body(Map.of("error", "Magic link login failed", "details", msg));
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    @Setter
    @Getter
    public static class LoginDto {
        private String email;
        private String password;
    }
}
