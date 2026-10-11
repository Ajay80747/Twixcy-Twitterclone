package com.twixcy.authservice.dto;

public record UserDTO(Long id, String username, String email, String firstName, String lastName, String profileImage, String bio, String bannerImage) {}
