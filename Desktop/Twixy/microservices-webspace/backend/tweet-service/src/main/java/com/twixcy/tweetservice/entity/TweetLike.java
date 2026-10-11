package com.twixcy.tweetservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tweet_likes", uniqueConstraints = @UniqueConstraint(name = "uk_like_tweet_user", columnNames = {"tweetId", "userId"}),
        indexes = @Index(name = "idx_like_user", columnList = "userId"))
public class TweetLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private Long tweetId;
    @Column(nullable = false) private Long userId;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;

    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getTweetId() { return tweetId; } public void setTweetId(Long v) { this.tweetId = v; }
    public Long getUserId() { return userId; } public void setUserId(Long v) { this.userId = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
