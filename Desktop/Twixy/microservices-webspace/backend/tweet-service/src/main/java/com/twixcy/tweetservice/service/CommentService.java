package com.twixcy.tweetservice.service;

import com.twixcy.tweetservice.dto.*;
import com.twixcy.tweetservice.entity.Comment;
import com.twixcy.tweetservice.exception.ForbiddenException;
import com.twixcy.tweetservice.exception.ResourceNotFoundException;
import com.twixcy.tweetservice.repository.CommentRepository;
import com.twixcy.tweetservice.repository.TweetRepository;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentService {
    private final CommentRepository comments;
    private final TweetRepository tweets;
    private final UserClient userClient;

    public CommentService(CommentRepository comments, TweetRepository tweets, UserClient userClient) {
        this.comments = comments;
        this.tweets = tweets;
        this.userClient = userClient;
    }

    @Transactional
    public CommentDTO add(Long tweetId, Long userId, CreateCommentRequest r) {
        if (!tweets.existsById(tweetId)) throw new ResourceNotFoundException("Tweet not found: " + tweetId);
        Comment c = new Comment();
        c.setTweetId(tweetId);
        c.setUserId(userId);
        c.setContent(r.content().trim());
        c = comments.save(c);
        return toDto(c, userClient.fetch(List.of(userId)));
    }

    @Transactional(readOnly = true)
    public List<CommentDTO> list(Long tweetId) {
        if (!tweets.existsById(tweetId)) throw new ResourceNotFoundException("Tweet not found: " + tweetId);
        List<Comment> list = comments.findByTweetIdOrderByCreatedAtAsc(tweetId);
        Map<Long, UserInfo> authors = userClient.fetch(list.stream().map(Comment::getUserId).toList());
        return list.stream().map(c -> toDto(c, authors)).toList();
    }

    @Transactional
    public CommentDTO update(Long id, Long currentUserId, CreateCommentRequest r) {
        Comment c = findOwned(id, currentUserId, "edit");
        c.setContent(r.content().trim());
        c = comments.save(c);
        return toDto(c, userClient.fetch(List.of(c.getUserId())));
    }

    @Transactional
    public void delete(Long id, Long currentUserId) {
        comments.delete(findOwned(id, currentUserId, "delete"));
    }

    private Comment findOwned(Long id, Long currentUserId, String action) {
        Comment c = comments.findById(id).orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + id));
        if (!c.getUserId().equals(currentUserId)) throw new ForbiddenException("You can only " + action + " your own comments");
        return c;
    }

    private CommentDTO toDto(Comment c, Map<Long, UserInfo> authors) {
        UserInfo a = authors.get(c.getUserId());
        return new CommentDTO(c.getId(), c.getTweetId(), c.getUserId(), a != null ? a.username() : "user" + c.getUserId(),
                a != null ? a.fullName() : "Unknown user", a != null ? a.profileImage() : null,
                c.getContent(), c.getCreatedAt(), c.getUpdatedAt());
    }
}
