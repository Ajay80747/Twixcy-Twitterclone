package com.twixcy.customerservice.repository;

import com.twixcy.customerservice.entity.UserProfile;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUserId(Long userId);
    Optional<UserProfile> findByUsername(String username);
    boolean existsByUserId(Long userId);
    boolean existsByUsername(String username);
    List<UserProfile> findByUserIdIn(Collection<Long> userIds);
    List<UserProfile> findByUsernameContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String username, String firstName, String lastName, Pageable pageable);
    List<UserProfile> findByUserIdNotOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
