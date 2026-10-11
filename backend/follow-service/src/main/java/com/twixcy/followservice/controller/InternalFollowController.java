package com.twixcy.followservice.controller;

import com.twixcy.followservice.service.FollowService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Service-to-service only (not routed by the gateway). */
@RestController
@RequestMapping("/internal/follows")
public class InternalFollowController {
    private final FollowService followService;

    public InternalFollowController(FollowService followService) { this.followService = followService; }

    @GetMapping("/following-ids/{userId}")
    public ResponseEntity<List<Long>> followingIds(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.followingIds(userId));
    }
}
