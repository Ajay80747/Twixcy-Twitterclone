package com.twixcy.followservice.service;

import com.twixcy.followservice.dto.*;
import com.twixcy.followservice.entity.Follow;
import com.twixcy.followservice.exception.DuplicateResourceException;
import com.twixcy.followservice.exception.InvalidRequestException;
import com.twixcy.followservice.exception.ResourceNotFoundException;
import com.twixcy.followservice.repository.FollowRepository;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FollowService {
    private final FollowRepository follows;

    public FollowService(FollowRepository follows) { this.follows = follows; }

    @Transactional
    public FollowDTO follow(Long currentUserId, Long targetUserId) {
        if (currentUserId.equals(targetUserId)) throw new InvalidRequestException("You cannot follow yourself");
        if (follows.existsByFollowerIdAndFollowingId(currentUserId, targetUserId)) {
            throw new DuplicateResourceException("You already follow this user");
        }
        Follow f = new Follow();
        f.setFollowerId(currentUserId);
        f.setFollowingId(targetUserId);
        try {
            return toDto(follows.saveAndFlush(f));
        } catch (DataIntegrityViolationException e) { // concurrent double-click hit the unique constraint
            throw new DuplicateResourceException("You already follow this user");
        }
    }

    @Transactional
    public void unfollow(Long currentUserId, Long targetUserId) {
        Follow f = follows.findByFollowerIdAndFollowingId(currentUserId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("You do not follow this user"));
        follows.delete(f);
    }

    @Transactional(readOnly = true)
    public List<FollowDTO> followers(Long userId) { return follows.findByFollowingIdOrderByCreatedAtDesc(userId).stream().map(this::toDto).toList(); }

    @Transactional(readOnly = true)
    public List<FollowDTO> following(Long userId) { return follows.findByFollowerIdOrderByCreatedAtDesc(userId).stream().map(this::toDto).toList(); }

    @Transactional(readOnly = true)
    public FollowStatusDTO status(Long currentUserId, Long targetUserId) {
        return new FollowStatusDTO(follows.existsByFollowerIdAndFollowingId(currentUserId, targetUserId),
                follows.existsByFollowerIdAndFollowingId(targetUserId, currentUserId));
    }

    @Transactional(readOnly = true)
    public FollowCountDTO counts(Long userId) { return new FollowCountDTO(follows.countByFollowingId(userId), follows.countByFollowerId(userId)); }

    @Transactional(readOnly = true)
    public List<Long> followingIds(Long userId) { return follows.findByFollowerIdOrderByCreatedAtDesc(userId).stream().map(Follow::getFollowingId).toList(); }

    private FollowDTO toDto(Follow f) { return new FollowDTO(f.getId(), f.getFollowerId(), f.getFollowingId(), f.getCreatedAt()); }
}
