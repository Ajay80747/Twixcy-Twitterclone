package com.twixcy.customerservice.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(@Size(min = 1, max = 50) String firstName, @Size(min = 1, max = 50) String lastName,
                                   @Size(max = 160) String bio, @Size(max = 500) String profileImage, @Size(max = 500) String bannerImage) {}
