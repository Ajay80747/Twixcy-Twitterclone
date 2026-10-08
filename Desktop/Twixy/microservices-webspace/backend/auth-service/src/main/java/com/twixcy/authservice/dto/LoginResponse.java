package com.twixcy.authservice.dto;

public record LoginResponse(String token, UserDTO user) {}
