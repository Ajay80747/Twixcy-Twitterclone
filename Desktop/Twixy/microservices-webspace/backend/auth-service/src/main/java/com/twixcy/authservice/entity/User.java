package com.twixcy.authservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_email", columnNames = "email"),
        @UniqueConstraint(name = "uk_users_username", columnNames = "username")})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 30) private String username;
    @Column(nullable = false, length = 120) private String email;
    /** PBKDF2 hash in the form iterations:salt:hash - never the raw password. */
    @Column(nullable = false, length = 255) private String password;
    @Column(nullable = false, length = 50) private String firstName;
    @Column(nullable = false, length = 50) private String lastName;
    @Column(length = 500) private String profileImage;
    @Column(length = 160) private String bio;
    @Column(length = 500) private String bannerImage;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Column(nullable = false) private boolean enabled = true;
    @Column(nullable = false, length = 20) private String role = "USER";

    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; } public void setUsername(String v) { this.username = v; }
    public String getEmail() { return email; } public void setEmail(String v) { this.email = v; }
    public String getPassword() { return password; } public void setPassword(String v) { this.password = v; }
    public String getFirstName() { return firstName; } public void setFirstName(String v) { this.firstName = v; }
    public String getLastName() { return lastName; } public void setLastName(String v) { this.lastName = v; }
    public String getProfileImage() { return profileImage; } public void setProfileImage(String v) { this.profileImage = v; }
    public String getBio() { return bio; } public void setBio(String v) { this.bio = v; }
    public String getBannerImage() { return bannerImage; } public void setBannerImage(String v) { this.bannerImage = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public boolean isEnabled() { return enabled; } public void setEnabled(boolean v) { this.enabled = v; }
    public String getRole() { return role; } public void setRole(String v) { this.role = v; }
}
