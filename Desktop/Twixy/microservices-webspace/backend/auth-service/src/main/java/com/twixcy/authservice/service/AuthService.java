package com.twixcy.authservice.service;

import com.twixcy.authservice.dto.*;
import com.twixcy.authservice.entity.User;
import com.twixcy.authservice.entity.UserSession;
import com.twixcy.authservice.exception.DuplicateResourceException;
import com.twixcy.authservice.exception.UnauthorizedException;
import com.twixcy.authservice.repository.UserRepository;
import com.twixcy.authservice.repository.UserSessionRepository;
import com.twixcy.authservice.security.PasswordHasher;
import com.twixcy.authservice.security.SessionTokenGenerator;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final UserSessionRepository sessions;
    private final PasswordHasher hasher;
    private final SessionTokenGenerator tokens;
    private final ProfileClient profileClient;
    private final long ttlHours;

    public AuthService(UserRepository users, UserSessionRepository sessions, PasswordHasher hasher,
                       SessionTokenGenerator tokens, ProfileClient profileClient,
                       @Value("${twixcy.session.ttl-hours:24}") long ttlHours) {
        this.users = users;
        this.sessions = sessions;
        this.hasher = hasher;
        this.tokens = tokens;
        this.profileClient = profileClient;
        this.ttlHours = ttlHours;
    }

    /** Rolls back the auth user if the profile cannot be created, keeping both databases consistent. */
    @Transactional
    public MessageResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        String username = request.username().trim();
        if (users.existsByEmail(email)) throw new DuplicateResourceException("Email is already registered");
        if (users.existsByUsername(username)) throw new DuplicateResourceException("Username is already taken");

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(hasher.hash(request.password()));
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setRole("USER");
        user.setEnabled(true);
        user = users.save(user);
        profileClient.createProfile(user);
        return new MessageResponse("User registered successfully");
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = users.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        if (!user.isEnabled() || !hasher.matches(request.password(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        UserSession session = new UserSession();
        session.setToken(tokens.generate());
        session.setUserId(user.getId());
        session.setExpiresAt(LocalDateTime.now().plusHours(ttlHours));
        session = sessions.save(session);
        return new LoginResponse(session.getToken(), toDto(user));
    }

    @Transactional
    public void logout(String authorizationHeader) {
        UserSession session = requireActiveSession(authorizationHeader);
        session.setRevoked(true);
        session.setRevokedAt(LocalDateTime.now());
        sessions.save(session);
    }

    @Transactional(readOnly = true)
    public SessionInfo validate(String authorizationHeader) {
        UserSession session = requireActiveSession(authorizationHeader);
        User user = users.findById(session.getUserId()).filter(User::isEnabled)
                .orElseThrow(() -> new UnauthorizedException("User not found or disabled"));
        return new SessionInfo(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }

    private UserSession requireActiveSession(String header) {
        if (header == null || !header.startsWith("Bearer ") || header.length() < 8) {
            throw new UnauthorizedException("Missing or malformed Authorization header");
        }
        UserSession session = sessions.findByToken(header.substring(7).trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid session"));
        if (session.isRevoked() || session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Session expired or revoked");
        }
        return session;
    }

    private UserDTO toDto(User u) {
        return new UserDTO(u.getId(), u.getUsername(), u.getEmail(), u.getFirstName(), u.getLastName(), u.getProfileImage(), u.getBio(), u.getBannerImage());
    }
}
