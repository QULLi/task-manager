package com.ph.controllers;

import com.ph.dto.ProfileDto;
import com.ph.model.Profile;
import com.ph.repositories.ProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

/**
 * Profile endpoints: sync (POST) and get by id (GET).
 */
@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileRepository profileRepository;

    public ProfileController(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    /**
     * Upsert profile for the authenticated user.
     * The server uses the authenticated subject as authoritative user id.
     */
    @PostMapping("/sync")
    public ResponseEntity<?> syncProfile(@RequestBody ProfileDto dto, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        // Use subject from token as the authoritative id — ignore dto.id
        String subject = authentication.getName();
        UUID uuid;
        try {
            uuid = UUID.fromString(subject);
        } catch (IllegalArgumentException ex) {
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
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProfile(@PathVariable String id, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        String subject = authentication.getName();
        if (!subject.equals(id)) {
            return ResponseEntity.status(403).body("Authenticated user does not match requested id");
        }

        UUID uuid;
        try {
            uuid = UUID.fromString(id);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Invalid UUID");
        }

        return profileRepository.findById(uuid)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
