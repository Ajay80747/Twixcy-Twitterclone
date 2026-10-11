package com.twixcy.authservice.security;

import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import org.springframework.stereotype.Component;

/** Salted PBKDF2-HMAC-SHA256 using only the JDK (no BCrypt / Spring Security). Format: iterations:salt:hash */
@Component
public class PasswordHasher {
    private static final int ITERATIONS = 120_000;
    private static final int KEY_BITS = 256;
    private final SecureRandom random = new SecureRandom();

    public String hash(String rawPassword) {
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        byte[] hash = derive(rawPassword.toCharArray(), salt, ITERATIONS);
        return ITERATIONS + ":" + Base64.getEncoder().encodeToString(salt) + ":" + Base64.getEncoder().encodeToString(hash);
    }

    public boolean matches(String rawPassword, String stored) {
        String[] parts = stored.split(":");
        if (parts.length != 3) return false;
        byte[] expected = Base64.getDecoder().decode(parts[2]);
        byte[] actual = derive(rawPassword.toCharArray(), Base64.getDecoder().decode(parts[1]), Integer.parseInt(parts[0]));
        return MessageDigest.isEqual(expected, actual);
    }

    private byte[] derive(char[] password, byte[] salt, int iterations) {
        try {
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
                    .generateSecret(new PBEKeySpec(password, salt, iterations, KEY_BITS)).getEncoded();
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Password hashing unavailable", e);
        }
    }
}
