package com.ph.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SecureController {

    @GetMapping("/api/secure")
    public ResponseEntity<String> secureEndpoint(Authentication authentication) {
        String username = authentication.getName(); // comes from Supabase JWT
        return ResponseEntity.ok("Hello, " + username + "! You have accessed a secure endpoint.");
    }
}
