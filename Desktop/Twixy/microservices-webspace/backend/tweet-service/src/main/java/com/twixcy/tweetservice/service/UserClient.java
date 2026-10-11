package com.twixcy.tweetservice.service;

import com.twixcy.tweetservice.dto.UserInfo;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/** Looks up author details in customer-service via Eureka. Degrades gracefully if it is unavailable. */
@Component
public class UserClient {
    private final RestClient restClient;

    public UserClient(RestClient.Builder builder) { this.restClient = builder.baseUrl("http://CUSTOMER-SERVICE").build(); }

    public Map<Long, UserInfo> fetch(Collection<Long> ids) {
        Map<Long, UserInfo> result = new HashMap<>();
        if (ids.isEmpty()) return result;
        try {
            String csv = ids.stream().distinct().map(String::valueOf).collect(Collectors.joining(","));
            UserInfo[] users = restClient.get().uri("/internal/users/batch?ids={ids}", csv).retrieve().body(UserInfo[].class);
            if (users != null) for (UserInfo u : users) result.put(u.id(), u);
        } catch (RestClientException ignored) {
            // fall back to placeholder author data
        }
        return result;
    }
}
