package com.ph.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

/*
 * Profile entity mapped to "profiles" table.
 */
@Entity
@Table(name = "profiles")
public class Profile {

    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @Column(name = "email")
    private String email;

    @Column(name = "username")
    private String username;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public Profile() {}

    public Profile(UUID id, String email, String username, String avatarUrl, OffsetDateTime updatedAt) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.updatedAt = updatedAt;
    }

    // getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
