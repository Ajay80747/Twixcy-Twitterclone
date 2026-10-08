package com.twixcy.authservice.service;

import com.twixcy.authservice.entity.User;
import java.util.Map;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** Creates the public profile in customer-service (resolved through Eureka). */
@Component
public class ProfileClient {
    private final RestClient restClient;

    public ProfileClient(RestClient.Builder builder) {
        this.restClient = builder.baseUrl("http://CUSTOMER-SERVICE").build();
    }

    public void createProfile(User user) {
        restClient.post().uri("/internal/users")
                .body(Map.of("userId", user.getId(), "username", user.getUsername(), "email", user.getEmail(),
                        "firstName", user.getFirstName(), "lastName", user.getLastName()))
                .retrieve().toBodilessEntity();
    }
}
