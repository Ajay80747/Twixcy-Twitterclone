package com.twixcy.followservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "follows", uniqueConstraints = @UniqueConstraint(name = "uk_follow_pair", columnNames = {"followerId", "followingId"}),
        indexes = {@Index(name = "idx_follow_follower", columnList = "followerId"), @Index(name = "idx_follow_following", columnList = "followingId")})
public class Follow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private Long followerId;
    @Column(nullable = false) private Long followingId;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;

    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getFollowerId() { return followerId; } public void setFollowerId(Long v) { this.followerId = v; }
    public Long getFollowingId() { return followingId; } public void setFollowingId(Long v) { this.followingId = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
