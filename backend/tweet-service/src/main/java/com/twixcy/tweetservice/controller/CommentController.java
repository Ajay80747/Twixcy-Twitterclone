package com.twixcy.tweetservice.controller;

import com.twixcy.tweetservice.dto.*;
import com.twixcy.tweetservice.service.CommentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class CommentController {
    private static final String USER = "X-User-Id";
    private final CommentService commentService;

    public CommentController(CommentService commentService) { this.commentService = commentService; }

    @PostMapping("/api/tweets/{tweetId:\\d+}/comment")
    public ResponseEntity<CommentDTO> add(@RequestHeader(USER) Long me, @PathVariable Long tweetId, @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.add(tweetId, me, request));
    }

    @GetMapping("/api/tweets/{tweetId:\\d+}/comments")
    public ResponseEntity<List<CommentDTO>> list(@PathVariable Long tweetId) {
        return ResponseEntity.ok(commentService.list(tweetId));
    }

    @PutMapping("/api/comments/{id:\\d+}")
    public ResponseEntity<CommentDTO> update(@RequestHeader(USER) Long me, @PathVariable Long id, @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.ok(commentService.update(id, me, request));
    }

    @DeleteMapping("/api/comments/{id:\\d+}")
    public ResponseEntity<Void> delete(@RequestHeader(USER) Long me, @PathVariable Long id) {
        commentService.delete(id, me);
        return ResponseEntity.noContent().build();
    }
}
