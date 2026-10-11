package com.twixcy.authservice.dto;

public record SessionInfo(Long userId, String username, String email, String role) {}
