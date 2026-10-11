package com.twixcy.followservice.controller;

import com.twixcy.followservice.dto.*;
import com.twixcy.followservice.service.FollowService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follows")
public class FollowController {
    private static final String USER = "X-User-Id";
    private final FollowService followService;

    public FollowController(FollowService followService) { this.followService = followService; }

    @PostMapping("/{userId:\\d+}")
    public ResponseEntity<FollowDTO> follow(@RequestHeader(USER) Long me, @PathVariable Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(followService.follow(me, userId));
    }

    @DeleteMapping("/{userId:\\d+}")
    public ResponseEntity<Void> unfollow(@RequestHeader(USER) Long me, @PathVariable Long userId) {
        followService.unfollow(me, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/followers/{userId:\\d+}")
    public ResponseEntity<List<FollowDTO>> followers(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.followers(userId));
    }

    @GetMapping("/following/{userId:\\d+}")
    public ResponseEntity<List<FollowDTO>> following(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.following(userId));
    }

    @GetMapping("/status/{userId:\\d+}")
    public ResponseEntity<FollowStatusDTO> status(@RequestHeader(USER) Long me, @PathVariable Long userId) {
        return ResponseEntity.ok(followService.status(me, userId));
    }

    @GetMapping("/count/{userId:\\d+}")
    public ResponseEntity<FollowCountDTO> count(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.counts(userId));
    }
}
