package com.twixcy.tweetservice.controller;

import com.twixcy.tweetservice.dto.*;
import com.twixcy.tweetservice.service.CommentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class CommentController {
    private static final String USER = "X-User-Id";
    private final CommentService commentService;

    public CommentController(CommentService commentService) { this.commentService = commentService; }

    @PostMapping("/api/tweets/{tweetId:\\d+}/comment")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentDTO add(@RequestHeader(USER) Long me, @PathVariable Long tweetId, @Valid @RequestBody CreateCommentRequest request) {
        return commentService.add(tweetId, me, request);
    }

    @GetMapping("/api/tweets/{tweetId:\\d+}/comments")
    public List<CommentDTO> list(@PathVariable Long tweetId) { return commentService.list(tweetId); }

    @PutMapping("/api/comments/{id:\\d+}")
    public CommentDTO update(@RequestHeader(USER) Long me, @PathVariable Long id, @Valid @RequestBody CreateCommentRequest request) {
        return commentService.update(id, me, request);
    }

    @DeleteMapping("/api/comments/{id:\\d+}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(USER) Long me, @PathVariable Long id) { commentService.delete(id, me); }
}
