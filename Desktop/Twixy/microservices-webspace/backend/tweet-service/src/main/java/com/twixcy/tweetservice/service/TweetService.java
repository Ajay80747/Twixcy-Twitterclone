package com.twixcy.tweetservice.service;

import com.twixcy.tweetservice.dto.*;
import com.twixcy.tweetservice.entity.Tweet;
import com.twixcy.tweetservice.entity.TweetLike;
import com.twixcy.tweetservice.exception.DuplicateResourceException;
import com.twixcy.tweetservice.exception.ForbiddenException;
import com.twixcy.tweetservice.exception.InvalidRequestException;
import com.twixcy.tweetservice.exception.ResourceNotFoundException;
import com.twixcy.tweetservice.repository.CommentRepository;
import com.twixcy.tweetservice.repository.TweetLikeRepository;
import com.twixcy.tweetservice.repository.TweetRepository;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TweetService {
    private static final int PAGE_SIZE = 50;
    private final TweetRepository tweets;
    private final TweetLikeRepository likes;
    private final CommentRepository comments;
    private final UserClient userClient;
    private final FollowClient followClient;

    public TweetService(TweetRepository tweets, TweetLikeRepository likes, CommentRepository comments,
                        UserClient userClient, FollowClient followClient) {
        this.tweets = tweets;
        this.likes = likes;
        this.comments = comments;
        this.userClient = userClient;
        this.followClient = followClient;
    }

    @Transactional
    public TweetDTO create(Long userId, CreateTweetRequest r) {
        String content  = blankToNull(r.content());
        String imageUrl = blankToNull(r.imageUrl());
        if (content == null && imageUrl == null) {
            throw new InvalidRequestException("Post must have text or an image.");
        }
        Tweet t = new Tweet();
        t.setUserId(userId);
        t.setContent(content);
        t.setImageUrl(imageUrl);
        return toDto(tweets.save(t), userId);
    }

    @Transactional(readOnly = true)
    public TweetDTO get(Long id, Long currentUserId) { return toDto(find(id), currentUserId); }

    @Transactional(readOnly = true)
    public List<TweetDTO> byUser(Long userId, Long currentUserId) {
        return toDtos(tweets.findByUserIdOrderByCreatedAtDesc(userId), currentUserId);
    }

    /** Tweets from people the caller follows, plus the caller's own. */
    @Transactional(readOnly = true)
    public List<TweetDTO> feed(Long currentUserId) {
        List<Long> authors = followClient.followingIds(currentUserId);
        authors.add(currentUserId);
        return toDtos(tweets.findByUserIdInOrderByCreatedAtDesc(authors, PageRequest.of(0, PAGE_SIZE)), currentUserId);
    }

    @Transactional(readOnly = true)
    public List<TweetDTO> explore(Long currentUserId) {
        return toDtos(tweets.findAll(PageRequest.of(0, PAGE_SIZE, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent(), currentUserId);
    }

    @Transactional
    public TweetDTO update(Long id, Long currentUserId, CreateTweetRequest r) {
        Tweet t = find(id);
        requireOwner(t, currentUserId, "edit");
        String content  = blankToNull(r.content());
        String imageUrl = blankToNull(r.imageUrl());
        if (content == null && imageUrl == null) {
            throw new InvalidRequestException("Post must have text or an image.");
        }
        t.setContent(content);
        t.setImageUrl(imageUrl);
        return toDto(tweets.save(t), currentUserId);
    }

    @Transactional
    public void delete(Long id, Long currentUserId) {
        Tweet t = find(id);
        requireOwner(t, currentUserId, "delete");
        likes.deleteByTweetId(id);
        comments.deleteByTweetId(id);
        tweets.delete(t);
    }

    @Transactional
    public TweetDTO like(Long id, Long currentUserId) {
        Tweet t = find(id);
        if (likes.existsByTweetIdAndUserId(id, currentUserId)) {
            throw new DuplicateResourceException("You already liked this tweet");
        }
        TweetLike like = new TweetLike();
        like.setTweetId(id);
        like.setUserId(currentUserId);
        likes.save(like);
        return toDto(t, currentUserId);
    }

    @Transactional
    public TweetDTO unlike(Long id, Long currentUserId) {
        Tweet t = find(id);
        likes.findByTweetIdAndUserId(id, currentUserId).ifPresent(likes::delete);
        return toDto(t, currentUserId);
    }

    private Tweet find(Long id) {
        return tweets.findById(id).orElseThrow(() -> new ResourceNotFoundException("Tweet not found: " + id));
    }

    private void requireOwner(Tweet t, Long currentUserId, String action) {
        if (!t.getUserId().equals(currentUserId)) throw new ForbiddenException("You can only " + action + " your own tweets");
    }

    private List<TweetDTO> toDtos(List<Tweet> list, Long currentUserId) {
        Map<Long, UserInfo> authors = userClient.fetch(list.stream().map(Tweet::getUserId).toList());
        return list.stream().map(t -> toDto(t, currentUserId, authors.get(t.getUserId()))).toList();
    }

    private TweetDTO toDto(Tweet t, Long currentUserId) {
        return toDto(t, currentUserId, userClient.fetch(List.of(t.getUserId())).get(t.getUserId()));
    }

    private TweetDTO toDto(Tweet t, Long currentUserId, UserInfo a) {
        return new TweetDTO(t.getId(), t.getUserId(), a != null ? a.username() : "user" + t.getUserId(),
                a != null ? a.fullName() : "Unknown user", a != null ? a.profileImage() : null,
                t.getContent(), t.getImageUrl(), t.getCreatedAt(), t.getUpdatedAt(),
                likes.countByTweetId(t.getId()), comments.countByTweetId(t.getId()),
                likes.existsByTweetIdAndUserId(t.getId(), currentUserId));
    }

    private String blankToNull(String s) { return s == null || s.isBlank() ? null : s.trim(); }
}
