package com.twixcy.tweetservice;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.twixcy.tweetservice.dto.CommentDTO;
import com.twixcy.tweetservice.dto.CreateCommentRequest;
import com.twixcy.tweetservice.entity.Comment;
import com.twixcy.tweetservice.exception.ForbiddenException;
import com.twixcy.tweetservice.repository.CommentRepository;
import com.twixcy.tweetservice.repository.TweetRepository;
import com.twixcy.tweetservice.service.CommentService;
import com.twixcy.tweetservice.service.UserClient;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CommentServiceTest {
    private final CommentRepository comments = mock(CommentRepository.class);
    private final TweetRepository tweets = mock(TweetRepository.class);
    private final UserClient userClient = mock(UserClient.class);
    private CommentService service;
    private Comment comment;

    @BeforeEach
    void setUp() {
        service = new CommentService(comments, tweets, userClient);
        comment = new Comment();
        comment.setId(5L); comment.setTweetId(10L); comment.setUserId(1L); comment.setContent("nice");
        when(tweets.existsById(10L)).thenReturn(true);
        when(comments.findById(5L)).thenReturn(Optional.of(comment));
        when(comments.save(any(Comment.class))).thenAnswer(i -> i.getArgument(0));
        when(userClient.fetch(any())).thenReturn(Map.of());
    }

    @Test
    void createComment() {
        CommentDTO dto = service.add(10L, 1L, new CreateCommentRequest(" hi "));
        assertEquals("hi", dto.content());
    }

    @Test
    void updateAndDeleteOwnComment() {
        assertEquals("changed", service.update(5L, 1L, new CreateCommentRequest("changed")).content());
        service.delete(5L, 1L);
        verify(comments).delete(comment);
    }

    @Test
    void cannotTouchOthersComment() {
        assertThrows(ForbiddenException.class, () -> service.update(5L, 2L, new CreateCommentRequest("x")));
        assertThrows(ForbiddenException.class, () -> service.delete(5L, 2L));
    }
}
