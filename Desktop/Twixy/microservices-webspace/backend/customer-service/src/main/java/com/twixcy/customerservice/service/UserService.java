package com.twixcy.customerservice.service;

import com.twixcy.customerservice.dto.*;
import com.twixcy.customerservice.entity.UserProfile;
import com.twixcy.customerservice.exception.DuplicateResourceException;
import com.twixcy.customerservice.exception.ForbiddenException;
import com.twixcy.customerservice.exception.ResourceNotFoundException;
import com.twixcy.customerservice.repository.UserProfileRepository;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserProfileRepository profiles;

    public UserService(UserProfileRepository profiles) { this.profiles = profiles; }

    @Transactional
    public UserDTO createProfile(CreateProfileRequest r) {
        if (profiles.existsByUserId(r.userId()) || profiles.existsByUsername(r.username())) {
            throw new DuplicateResourceException("Profile already exists");
        }
        UserProfile p = new UserProfile();
        p.setUserId(r.userId()); p.setUsername(r.username()); p.setEmail(r.email());
        p.setFirstName(r.firstName()); p.setLastName(r.lastName());
        return toDto(profiles.save(p));
    }

    @Transactional(readOnly = true)
    public UserDTO getById(Long userId) {
        return toDto(profiles.findByUserId(userId).orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId)));
    }

    @Transactional(readOnly = true)
    public UserDTO getByUsername(String username) {
        return toDto(profiles.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found: " + username)));
    }

    @Transactional
    public UserDTO update(Long targetUserId, Long currentUserId, UpdateProfileRequest r) {
        if (!targetUserId.equals(currentUserId)) throw new ForbiddenException("You can only edit your own profile");
        UserProfile p = profiles.findByUserId(targetUserId).orElseThrow(() -> new ResourceNotFoundException("User not found: " + targetUserId));
        if (r.firstName() != null) p.setFirstName(r.firstName().trim());
        if (r.lastName() != null) p.setLastName(r.lastName().trim());
        if (r.bio() != null) p.setBio(r.bio().trim());
        if (r.profileImage() != null) p.setProfileImage(r.profileImage().trim().isEmpty() ? null : r.profileImage().trim());
        if (r.bannerImage() != null) p.setBannerImage(r.bannerImage().trim().isEmpty() ? null : r.bannerImage().trim());
        return toDto(profiles.save(p));
    }

    @Transactional(readOnly = true)
    public List<UserDTO> search(String keyword) {
        String k = keyword == null ? "" : keyword.trim();
        if (k.isEmpty()) return List.of();
        return profiles.findByUsernameContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(k, k, k, PageRequest.of(0, 20))
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<UserDTO> suggestions(Long currentUserId) {
        return profiles.findByUserIdNotOrderByCreatedAtDesc(currentUserId, PageRequest.of(0, 5)).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<UserDTO> batch(Collection<Long> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        return profiles.findByUserIdIn(ids).stream().map(this::toDto).toList();
    }

    private UserDTO toDto(UserProfile p) {
        return new UserDTO(p.getUserId(), p.getUsername(), p.getEmail(), p.getFirstName(), p.getLastName(), p.getBio(), p.getProfileImage(), p.getBannerImage());
    }
}
