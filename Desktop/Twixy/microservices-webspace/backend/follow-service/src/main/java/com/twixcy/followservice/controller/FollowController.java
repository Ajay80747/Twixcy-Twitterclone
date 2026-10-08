package com.twixcy.followservice.controller;

import com.twixcy.followservice.dto.*;
import com.twixcy.followservice.service.FollowService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follows")
public class FollowController {
    private static final String USER = "X-User-Id";
    private final FollowService followService;

    public FollowController(FollowService followService) { this.followService = followService; }

    @PostMapping("/{userId:\\d+}")
    @ResponseStatus(HttpStatus.CREATED)
    public FollowDTO follow(@RequestHeader(USER) Long me, @PathVariable Long userId) { return followService.follow(me, userId); }

    @DeleteMapping("/{userId:\\d+}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unfollow(@RequestHeader(USER) Long me, @PathVariable Long userId) { followService.unfollow(me, userId); }

    @GetMapping("/followers/{userId:\\d+}")
    public List<FollowDTO> followers(@PathVariable Long userId) { return followService.followers(userId); }

    @GetMapping("/following/{userId:\\d+}")
    public List<FollowDTO> following(@PathVariable Long userId) { return followService.following(userId); }

    @GetMapping("/status/{userId:\\d+}")
    public FollowStatusDTO status(@RequestHeader(USER) Long me, @PathVariable Long userId) { return followService.status(me, userId); }

    @GetMapping("/count/{userId:\\d+}")
    public FollowCountDTO count(@PathVariable Long userId) { return followService.counts(userId); }
}
