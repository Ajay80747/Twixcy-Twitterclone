package com.twixcy.tweetservice.dto;

import java.time.LocalDateTime;

public record CommentDTO(Long id, Long tweetId, Long userId, String username, String name, String profileImage,
                         String content, LocalDateTime createdAt, LocalDateTime updatedAt) {}
