package com.twixcy.customerservice.dto;

import jakarta.validation.constraints.*;

public record CreateProfileRequest(@NotNull Long userId, @NotBlank String username, @NotBlank String email,
                                   @NotBlank String firstName, @NotBlank String lastName) {}
