package com.twixcy.tweetservice.dto;

import jakarta.validation.constraints.Size;

/**
 * Either content OR imageUrl (or both) must be present — validated in TweetService.
 * @NotBlank was removed from content to allow image-only posts.
 */
public record CreateTweetRequest(
        @Size(max = 280, message = "Tweet must be at most 280 characters") String content,
        @Size(max = 2000, message = "Image URL too long") String imageUrl) {}
