package com.twixcy.authservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Database-backed login session. The opaque token is the only thing the client holds. */
@Entity
@Table(name = "user_sessions", uniqueConstraints = @UniqueConstraint(name = "uk_session_token", columnNames = "token"),
        indexes = @Index(name = "idx_session_user", columnList = "userId"))
public class UserSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 64) private String token;
    @Column(nullable = false) private Long userId;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(nullable = false) private LocalDateTime expiresAt;
    @Column(nullable = false) private boolean revoked;
    private LocalDateTime revokedAt;

    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getToken() { return token; } public void setToken(String v) { this.token = v; }
    public Long getUserId() { return userId; } public void setUserId(Long v) { this.userId = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; } public void setExpiresAt(LocalDateTime v) { this.expiresAt = v; }
    public boolean isRevoked() { return revoked; } public void setRevoked(boolean v) { this.revoked = v; }
    public LocalDateTime getRevokedAt() { return revokedAt; } public void setRevokedAt(LocalDateTime v) { this.revokedAt = v; }
}
