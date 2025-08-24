package com.ph.dto;

/*
 * DTO used for profile sync requests.
 */
public class ProfileDto {
    private String id; // Supabase user id (UUID string)
    private String email;
    private String username;
    private String website;
    private String avatar_url;

    // getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getAvatar_url() { return avatar_url; }
    public void setAvatar_url(String avatar_url) { this.avatar_url = avatar_url; }
}
