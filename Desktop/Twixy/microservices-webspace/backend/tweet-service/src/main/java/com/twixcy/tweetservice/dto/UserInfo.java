package com.twixcy.tweetservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UserInfo(Long id, String username, String firstName, String lastName, String profileImage) {
    public String fullName() { return (firstName + " " + lastName).trim(); }
}
