package com.twixcy.authservice;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.twixcy.authservice.dto.*;
import com.twixcy.authservice.entity.User;
import com.twixcy.authservice.entity.UserSession;
import com.twixcy.authservice.exception.UnauthorizedException;
import com.twixcy.authservice.repository.UserRepository;
import com.twixcy.authservice.repository.UserSessionRepository;
import com.twixcy.authservice.security.PasswordHasher;
import com.twixcy.authservice.security.SessionTokenGenerator;
import com.twixcy.authservice.service.AuthService;
import com.twixcy.authservice.service.ProfileClient;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AuthServiceTest {
    private final UserRepository users = mock(UserRepository.class);
    private final UserSessionRepository sessions = mock(UserSessionRepository.class);
    private final ProfileClient profileClient = mock(ProfileClient.class);
    private final PasswordHasher hasher = new PasswordHasher();
    private AuthService service;
    private User user;

    @BeforeEach
    void setUp() {
        service = new AuthService(users, sessions, hasher, new SessionTokenGenerator(), profileClient, 24);
        user = new User();
        user.setId(1L); user.setUsername("ajay"); user.setEmail("ajay@gmail.com");
        user.setPassword(hasher.hash("password")); user.setFirstName("Ajay"); user.setLastName("Kumar");
        when(sessions.save(any(UserSession.class))).thenAnswer(i -> i.getArgument(0));
        when(users.save(any(User.class))).thenAnswer(i -> { User u = i.getArgument(0); u.setId(1L); return u; });
    }

    @Test
    void registerStoresHashedPasswordAndCreatesProfile() {
        MessageResponse r = service.register(new RegisterRequest("ajay", "Ajay@Gmail.com", "password", "Ajay", "Kumar"));
        assertEquals("User registered successfully", r.message());
        verify(users).save(argThat(u -> !u.getPassword().equals("password") && u.getEmail().equals("ajay@gmail.com")));
        verify(profileClient).createProfile(any(User.class));
    }

    @Test
    void loginReturnsToken() {
        when(users.findByEmail("ajay@gmail.com")).thenReturn(Optional.of(user));
        LoginResponse res = service.login(new LoginRequest("ajay@gmail.com", "password"));
        assertNotNull(res.token());
        assertEquals("ajay", res.user().username());
    }

    @Test
    void invalidPasswordIsRejected() {
        when(users.findByEmail("ajay@gmail.com")).thenReturn(Optional.of(user));
        assertThrows(UnauthorizedException.class, () -> service.login(new LoginRequest("ajay@gmail.com", "wrong")));
    }

    @Test
    void logoutRevokesSessionAndRevokedTokenIsRejected() {
        UserSession s = new UserSession();
        s.setToken("tok"); s.setUserId(1L); s.setExpiresAt(LocalDateTime.now().plusHours(1));
        when(sessions.findByToken("tok")).thenReturn(Optional.of(s));
        when(users.findById(1L)).thenReturn(Optional.of(user));

        assertEquals("ajay", service.validate("Bearer tok").username());
        service.logout("Bearer tok");
        assertTrue(s.isRevoked());
        assertThrows(UnauthorizedException.class, () -> service.validate("Bearer tok"));
    }
}
