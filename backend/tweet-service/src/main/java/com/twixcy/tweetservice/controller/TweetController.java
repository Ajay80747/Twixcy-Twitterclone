package com.twixcy.tweetservice.controller;

import com.twixcy.tweetservice.dto.*;
import com.twixcy.tweetservice.service.TweetService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tweets")
public class TweetController {
    private static final String USER = "X-User-Id";
    private final TweetService tweetService;

    public TweetController(TweetService tweetService) { this.tweetService = tweetService; }

    @PostMapping
    public ResponseEntity<TweetDTO> create(@RequestHeader(USER) Long me, @Valid @RequestBody CreateTweetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tweetService.create(me, request));
    }

    @GetMapping("/feed")
    public ResponseEntity<List<TweetDTO>> feed(@RequestHeader(USER) Long me) {
        return ResponseEntity.ok(tweetService.feed(me));
    }

    @GetMapping("/explore")
    public ResponseEntity<List<TweetDTO>> explore(@RequestHeader(USER) Long me) {
        return ResponseEntity.ok(tweetService.explore(me));
    }

    @GetMapping("/user/{userId:\\d+}")
    public ResponseEntity<List<TweetDTO>> byUser(@RequestHeader(USER) Long me, @PathVariable Long userId) {
        return ResponseEntity.ok(tweetService.byUser(userId, me));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<TweetDTO> get(@RequestHeader(USER) Long me, @PathVariable Long id) {
        return ResponseEntity.ok(tweetService.get(id, me));
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<TweetDTO> update(@RequestHeader(USER) Long me, @PathVariable Long id, @Valid @RequestBody CreateTweetRequest request) {
        return ResponseEntity.ok(tweetService.update(id, me, request));
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(@RequestHeader(USER) Long me, @PathVariable Long id) {
        tweetService.delete(id, me);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id:\\d+}/like")
    public ResponseEntity<TweetDTO> like(@RequestHeader(USER) Long me, @PathVariable Long id) {
        return ResponseEntity.ok(tweetService.like(id, me));
    }

    @DeleteMapping("/{id:\\d+}/like")
    public ResponseEntity<TweetDTO> unlike(@RequestHeader(USER) Long me, @PathVariable Long id) {
        return ResponseEntity.ok(tweetService.unlike(id, me));
    }
}
