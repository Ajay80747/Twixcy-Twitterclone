package com.twixcy.authservice.dto;

import jakarta.validation.constraints.*;

public record RegisterRequest(
        @NotBlank @Size(min = 3, max = 30) @Pattern(regexp = "^[A-Za-z0-9_]+$", message = "only letters, digits and underscore allowed") String username,
        @NotBlank @Email @Size(max = 120) String email,
        @NotBlank @Size(min = 6, max = 100) String password,
        @NotBlank @Size(max = 50) String firstName,
        @NotBlank @Size(max = 50) String lastName) {}
