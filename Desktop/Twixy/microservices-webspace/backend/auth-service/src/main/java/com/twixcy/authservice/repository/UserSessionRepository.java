package com.twixcy.authservice.repository;

import com.twixcy.authservice.entity.UserSession;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findByToken(String token);
}
