package com.twixcy.tweetservice.repository;

import com.twixcy.tweetservice.entity.TweetLike;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TweetLikeRepository extends JpaRepository<TweetLike, Long> {
    boolean existsByTweetIdAndUserId(Long tweetId, Long userId);
    Optional<TweetLike> findByTweetIdAndUserId(Long tweetId, Long userId);
    long countByTweetId(Long tweetId);
    void deleteByTweetId(Long tweetId);
}
