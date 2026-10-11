package com.twixcy.customerservice;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.twixcy.customerservice.dto.UpdateProfileRequest;
import com.twixcy.customerservice.dto.UserDTO;
import com.twixcy.customerservice.entity.UserProfile;
import com.twixcy.customerservice.exception.ForbiddenException;
import com.twixcy.customerservice.repository.UserProfileRepository;
import com.twixcy.customerservice.service.UserService;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class UserServiceTest {
    private final UserProfileRepository repo = mock(UserProfileRepository.class);
    private UserService service;

    @BeforeEach
    void setUp() {
        service = new UserService(repo);
        UserProfile p = new UserProfile();
        p.setUserId(1L); p.setUsername("ajay"); p.setEmail("a@b.c"); p.setFirstName("Ajay"); p.setLastName("Kumar");
        when(repo.findByUserId(1L)).thenReturn(Optional.of(p));
        when(repo.save(any(UserProfile.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void getProfile() { assertEquals("ajay", service.getById(1L).username()); }

    @Test
    void updateOwnProfile() {
        UserDTO dto = service.update(1L, 1L, new UpdateProfileRequest(null, null, "hello", null, null));
        assertEquals("hello", dto.bio());
    }

    @Test
    void cannotUpdateSomeoneElse() {
        assertThrows(ForbiddenException.class, () -> service.update(1L, 2L, new UpdateProfileRequest(null, null, "x", null, null)));
    }
}
