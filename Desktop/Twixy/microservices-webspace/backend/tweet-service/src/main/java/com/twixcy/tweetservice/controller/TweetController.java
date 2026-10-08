package com.twixcy.tweetservice.controller;

import com.twixcy.tweetservice.dto.*;
import com.twixcy.tweetservice.service.TweetService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tweets")
public class TweetController {
    private static final String USER = "X-User-Id";
    private final TweetService tweetService;

    public TweetController(TweetService tweetService) { this.tweetService = tweetService; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TweetDTO create(@RequestHeader(USER) Long me, @Valid @RequestBody CreateTweetRequest request) { return tweetService.create(me, request); }

    @GetMapping("/feed")
    public List<TweetDTO> feed(@RequestHeader(USER) Long me) { return tweetService.feed(me); }

    @GetMapping("/explore")
    public List<TweetDTO> explore(@RequestHeader(USER) Long me) { return tweetService.explore(me); }

    @GetMapping("/user/{userId:\\d+}")
    public List<TweetDTO> byUser(@RequestHeader(USER) Long me, @PathVariable Long userId) { return tweetService.byUser(userId, me); }

    @GetMapping("/{id:\\d+}")
    public TweetDTO get(@RequestHeader(USER) Long me, @PathVariable Long id) { return tweetService.get(id, me); }

    @PutMapping("/{id:\\d+}")
    public TweetDTO update(@RequestHeader(USER) Long me, @PathVariable Long id, @Valid @RequestBody CreateTweetRequest request) {
        return tweetService.update(id, me, request);
    }

    @DeleteMapping("/{id:\\d+}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(USER) Long me, @PathVariable Long id) { tweetService.delete(id, me); }

    @PostMapping("/{id:\\d+}/like")
    public TweetDTO like(@RequestHeader(USER) Long me, @PathVariable Long id) { return tweetService.like(id, me); }

    @DeleteMapping("/{id:\\d+}/like")
    public TweetDTO unlike(@RequestHeader(USER) Long me, @PathVariable Long id) { return tweetService.unlike(id, me); }
}
