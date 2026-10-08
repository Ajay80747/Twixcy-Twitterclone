package com.twixcy.tweetservice.service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class FollowClient {
    private final RestClient restClient;

    public FollowClient(RestClient.Builder builder) { this.restClient = builder.baseUrl("http://FOLLOW-SERVICE").build(); }

    public List<Long> followingIds(Long userId) {
        try {
            Long[] ids = restClient.get().uri("/internal/follows/following-ids/{id}", userId).retrieve().body(Long[].class);
            return ids == null ? new ArrayList<>() : new ArrayList<>(List.of(ids));
        } catch (RestClientException e) {
            return new ArrayList<>();
        }
    }
}
