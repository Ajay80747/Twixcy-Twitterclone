package com.twixcy.followservice;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.twixcy.followservice.dto.FollowDTO;
import com.twixcy.followservice.entity.Follow;
import com.twixcy.followservice.exception.DuplicateResourceException;
import com.twixcy.followservice.exception.InvalidRequestException;
import com.twixcy.followservice.repository.FollowRepository;
import com.twixcy.followservice.service.FollowService;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FollowServiceTest {
    private final FollowRepository repo = mock(FollowRepository.class);
    private FollowService service;

    @BeforeEach
    void setUp() {
        service = new FollowService(repo);
        when(repo.saveAndFlush(any(Follow.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void followUser() {
        FollowDTO dto = service.follow(1L, 2L);
        assertEquals(1L, dto.followerId());
        assertEquals(2L, dto.followingId());
    }

    @Test
    void selfFollowIsRejected() { assertThrows(InvalidRequestException.class, () -> service.follow(1L, 1L)); }

    @Test
    void duplicateFollowIsRejected() {
        when(repo.existsByFollowerIdAndFollowingId(1L, 2L)).thenReturn(true);
        assertThrows(DuplicateResourceException.class, () -> service.follow(1L, 2L));
    }

    @Test
    void unfollow() {
        Follow f = new Follow();
        when(repo.findByFollowerIdAndFollowingId(1L, 2L)).thenReturn(Optional.of(f));
        service.unfollow(1L, 2L);
        verify(repo).delete(f);
    }
}
