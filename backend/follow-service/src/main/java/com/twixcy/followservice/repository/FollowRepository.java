package com.twixcy.followservice.repository;

import com.twixcy.followservice.entity.Follow;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);
    List<Follow> findByFollowingIdOrderByCreatedAtDesc(Long followingId);
    List<Follow> findByFollowerIdOrderByCreatedAtDesc(Long followerId);
    long countByFollowingId(Long followingId);
    long countByFollowerId(Long followerId);
}
