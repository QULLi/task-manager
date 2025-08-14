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
 * Sync profile endpoint. Requires authentication (Supabase JWT).
 */
@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileRepository profileRepository;

    public ProfileController(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncProfile(@RequestBody ProfileDto dto, Authentication authentication) {
        // The authentication name must match the Supabase user id (sub)
        String authName = authentication.getName(); // expected to be user id (uuid) from Supabase
        if (!authName.equals(dto.getId())) {
            return ResponseEntity.status(403).body("Authenticated user does not match payload id");
        }

        UUID uuid;
        try {
            uuid = UUID.fromString(dto.getId());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Invalid UUID for id");
        }

        Profile profile = profileRepository.findById(uuid).orElseGet(() -> new Profile());
        profile.setId(uuid);
        profile.setEmail(dto.getEmail());
        profile.setUsername(dto.getUsername());
        profile.setAvatarUrl(dto.getAvatar_url());
        profile.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        profileRepository.save(profile);
        return ResponseEntity.ok().build();
    }
}
