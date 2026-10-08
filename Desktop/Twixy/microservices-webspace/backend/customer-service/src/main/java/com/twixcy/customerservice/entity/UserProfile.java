package com.twixcy.customerservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Public profile. userId is the id issued by auth-service (no cross-database relationship). */
@Entity
@Table(name = "user_profiles", uniqueConstraints = {
        @UniqueConstraint(name = "uk_profile_user", columnNames = "userId"),
        @UniqueConstraint(name = "uk_profile_username", columnNames = "username")})
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private Long userId;
    @Column(nullable = false, length = 30) private String username;
    @Column(nullable = false, length = 120) private String email;
    @Column(nullable = false, length = 50) private String firstName;
    @Column(nullable = false, length = 50) private String lastName;
    @Column(length = 160) private String bio;
    @Column(length = 500) private String profileImage;
    @Column(length = 500) private String bannerImage;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; } public void setUserId(Long v) { this.userId = v; }
    public String getUsername() { return username; } public void setUsername(String v) { this.username = v; }
    public String getEmail() { return email; } public void setEmail(String v) { this.email = v; }
    public String getFirstName() { return firstName; } public void setFirstName(String v) { this.firstName = v; }
    public String getLastName() { return lastName; } public void setLastName(String v) { this.lastName = v; }
    public String getBio() { return bio; } public void setBio(String v) { this.bio = v; }
    public String getProfileImage() { return profileImage; } public void setProfileImage(String v) { this.profileImage = v; }
    public String getBannerImage() { return bannerImage; } public void setBannerImage(String v) { this.bannerImage = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
