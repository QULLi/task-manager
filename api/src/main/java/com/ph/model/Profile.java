package com.ph.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Profile entity mapped to "profiles" table.
 */
@Setter
@Getter
@Entity
@Table(name = "profiles")
public class Profile {

    // getters and setters
    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @Column(name = "email")
    private String email;

    @Column(name = "username")
    private String username;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "website")
    private String website;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public Profile() {}

}
