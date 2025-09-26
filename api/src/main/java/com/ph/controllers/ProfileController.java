package com.ph.controllers;

import com.ph.dto.ProfileDto;
import com.ph.model.Profile;
import com.ph.repositories.ProfileRepository;
import com.ph.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

/**
 * REST controller for user profiles.
 * Supports syncing (POST) and retrieving (GET) profile data.
 * Access is restricted to the authenticated user.
 */
@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private static final Logger log = LoggerFactory.getLogger(ProfileController.class);

    private final ProfileRepository profileRepository;
    private final JwtService jwtService;

    public ProfileController(ProfileRepository profileRepository, JwtService jwtService) {
        this.profileRepository = profileRepository;
        this.jwtService = jwtService;
    }

    /**
     * Upsert profile for the authenticated user.
     * Uses authenticated subject (UUID) as authoritative id.
     */
    @PostMapping("/sync")
    public ResponseEntity<?> syncProfile(@RequestBody ProfileDto dto, Authentication authentication) {
        if (authentication == null) {
            log.warn("SyncProfile: Not authenticated");
            return ResponseEntity.status(401).body("Not authenticated");
        }

        String subject;
        try {
            // This method handles either plain UUID principals or principals that contain a JWT.
            subject = jwtService.getUserIdFromAuthentication(authentication);
        } catch (IllegalArgumentException ex) {
            log.error("SyncProfile: Could not resolve subject from authentication", ex);
            return ResponseEntity.badRequest().body("Authenticated subject is not a valid UUID");
        }

        log.info("SyncProfile: Authenticated subject = {}", subject);

        UUID uuid;
        try {
            uuid = UUID.fromString(subject);
        } catch (IllegalArgumentException ex) {
            log.error("SyncProfile: Invalid UUID from subject '{}'", subject, ex);
            return ResponseEntity.badRequest().body("Authenticated subject is not a valid UUID");
        }

        Profile profile = profileRepository.findById(uuid).orElseGet(Profile::new);
        profile.setId(uuid);
        profile.setEmail(dto.getEmail());
        profile.setUsername(dto.getUsername());
        profile.setWebsite(dto.getWebsite());
        profile.setAvatarUrl(dto.getAvatar_url());
        profile.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        Profile saved = profileRepository.save(profile);
        return ResponseEntity.ok(saved);
    }

    /**
     * Get profile by id. Only the authenticated user matching the id can retrieve it.
     *
     * Endpoint: GET /api/profiles/{id}
     * For backwards compatibility this also supports id == "me" (resolves to authenticated user).
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProfile(@PathVariable String id, Authentication authentication) {
        if (authentication == null) {
            log.warn("GetProfile: Not authenticated");
            return ResponseEntity.status(401).body("Not authenticated");
        }

        String authSubject;
        try {
            authSubject = jwtService.getUserIdFromAuthentication(authentication);
        } catch (IllegalArgumentException ex) {
            log.error("GetProfile: Could not resolve subject from authentication", ex);
            return ResponseEntity.badRequest().body("Authenticated subject is not a valid UUID");
        }

        log.info("GetProfile: Authenticated subject = {}", authSubject);
        log.info("GetProfile: Requested id = {}", id);

        UUID uuid;
        try {
            if ("me".equalsIgnoreCase(id)) {
                uuid = UUID.fromString(authSubject);
                log.info("GetProfile: Using authenticated UUID = {}", uuid);
            } else {
                uuid = UUID.fromString(id);
                log.info("GetProfile: Parsed requested UUID = {}", uuid);

                if (!uuid.toString().equals(authSubject)) {
                    log.warn("GetProfile: Authenticated user does not match requested id");
                    return ResponseEntity.status(403).body("Authenticated user does not match requested id");
                }
            }
        } catch (IllegalArgumentException ex) {
            log.error("GetProfile: Invalid UUID", ex);
            return ResponseEntity.badRequest().body("Invalid UUID");
        }

        return profileRepository.findById(uuid)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
