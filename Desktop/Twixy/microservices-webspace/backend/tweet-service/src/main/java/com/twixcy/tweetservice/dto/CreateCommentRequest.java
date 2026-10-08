package com.twixcy.tweetservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCommentRequest(@NotBlank(message = "Comment cannot be empty") @Size(max = 280, message = "Comment must be at most 280 characters") String content) {}
