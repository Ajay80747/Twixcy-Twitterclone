package com.twixcy.authservice.security;

import java.security.SecureRandom;
import java.util.Base64;
import org.springframework.stereotype.Component;

@Component
public class SessionTokenGenerator {
    private final SecureRandom random = new SecureRandom();

    /** 256 bits of randomness, URL-safe (43 chars). */
    public String generate() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
