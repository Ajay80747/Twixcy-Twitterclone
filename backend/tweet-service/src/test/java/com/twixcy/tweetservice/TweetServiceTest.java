package com.twixcy.tweetservice;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.twixcy.tweetservice.dto.*;
import com.twixcy.tweetservice.entity.Tweet;
import com.twixcy.tweetservice.entity.TweetLike;
import com.twixcy.tweetservice.exception.DuplicateResourceException;
import com.twixcy.tweetservice.exception.ForbiddenException;
import com.twixcy.tweetservice.repository.*;
import com.twixcy.tweetservice.service.*;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TweetServiceTest {
    private final TweetRepository tweets = mock(TweetRepository.class);
    private final TweetLikeRepository likes = mock(TweetLikeRepository.class);
    private final CommentRepository comments = mock(CommentRepository.class);
    private final UserClient userClient = mock(UserClient.class);
    private final FollowClient followClient = mock(FollowClient.class);
    private TweetService service;
    private Tweet tweet;

    @BeforeEach
    void setUp() {
        service = new TweetService(tweets, likes, comments, userClient, followClient);
        tweet = new Tweet();
        tweet.setId(10L); tweet.setUserId(1L); tweet.setContent("hello");
        when(tweets.findById(10L)).thenReturn(Optional.of(tweet));
        when(tweets.save(any(Tweet.class))).thenAnswer(i -> i.getArgument(0));
        when(userClient.fetch(any())).thenReturn(Map.of());
    }

    @Test
    void createTweet() {
        TweetDTO dto = service.create(1L, new CreateTweetRequest("  first tweet ", null));
        assertEquals("first tweet", dto.content());
        assertEquals(1L, dto.userId());
    }

    @Test
    void getTweet() { assertEquals(10L, service.get(10L, 1L).id()); }

    @Test
    void updateOwnTweet() { assertEquals("edited", service.update(10L, 1L, new CreateTweetRequest("edited", null)).content()); }

    @Test
    void cannotUpdateOrDeleteOthersTweet() {
        assertThrows(ForbiddenException.class, () -> service.update(10L, 2L, new CreateTweetRequest("x", null)));
        assertThrows(ForbiddenException.class, () -> service.delete(10L, 2L));
    }

    @Test
    void deleteOwnTweet() {
        service.delete(10L, 1L);
        verify(tweets).delete(tweet);
    }

    @Test
    void likeThenDuplicateLikeIsRejected() {
        when(likes.existsByTweetIdAndUserId(10L, 2L)).thenReturn(false);
        service.like(10L, 2L);
        verify(likes).save(any(TweetLike.class));
        when(likes.existsByTweetIdAndUserId(10L, 2L)).thenReturn(true);
        assertThrows(DuplicateResourceException.class, () -> service.like(10L, 2L));
    }

    @Test
    void unlikeRemovesLike() {
        TweetLike like = new TweetLike();
        when(likes.findByTweetIdAndUserId(10L, 2L)).thenReturn(Optional.of(like));
        service.unlike(10L, 2L);
        verify(likes).delete(like);
    }
}
