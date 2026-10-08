package com.twixcy.tweetservice.dto;

import java.time.LocalDateTime;

public record TweetDTO(Long id, Long userId, String username, String name, String profileImage, String content,
                       String imageUrl, LocalDateTime createdAt, LocalDateTime updatedAt,
                       long likeCount, long commentCount, boolean likedByMe) {}
