package com.ph.repositories;

import com.ph.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * JPA repository for Profile entity.
 */
@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    // default JPA methods are sufficient
}
