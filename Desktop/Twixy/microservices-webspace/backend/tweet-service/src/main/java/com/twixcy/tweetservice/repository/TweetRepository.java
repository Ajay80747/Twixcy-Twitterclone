package com.twixcy.tweetservice.repository;

import com.twixcy.tweetservice.entity.Tweet;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TweetRepository extends JpaRepository<Tweet, Long> {
    List<Tweet> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Tweet> findByUserIdInOrderByCreatedAtDesc(Collection<Long> userIds, Pageable pageable);
}
