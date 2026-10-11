package com.twixcy.authservice.config;

import com.twixcy.authservice.entity.User;
import com.twixcy.authservice.repository.UserRepository;
import com.twixcy.authservice.security.PasswordHasher;
import com.twixcy.authservice.service.ProfileClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates four demo users on first startup so the app works out-of-the-box.
 * Credentials: alice@twixcy.dev / password123  (and bob, carol, dave)
 */
@Component
public class DemoUserSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoUserSeeder.class);

    private final UserRepository users;
    private final PasswordHasher hasher;
    private final ProfileClient  profileClient;

    public DemoUserSeeder(UserRepository users, PasswordHasher hasher, ProfileClient profileClient) {
        this.users         = users;
        this.hasher        = hasher;
        this.profileClient = profileClient;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (users.count() > 0) {
            log.info("DemoUserSeeder: users already present – skipping.");
            return;
        }
        log.info("DemoUserSeeder: seeding demo users …");
        seed("alice",   "alice@twixcy.dev",  "Alice",   "Johnson",  "password123");
        seed("bob",     "bob@twixcy.dev",    "Bob",     "Smith",    "password123");
        seed("carol",   "carol@twixcy.dev",  "Carol",   "Williams", "password123");
        seed("dave",    "dave@twixcy.dev",   "Dave",    "Brown",    "password123");
        log.info("DemoUserSeeder: 4 demo users created. Login with e.g. alice@twixcy.dev / password123");
    }

    private void seed(String username, String email, String firstName, String lastName, String password) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setPassword(hasher.hash(password));
        u.setRole("USER");
        u.setEnabled(true);
        u = users.save(u);
        try { profileClient.createProfile(u); } catch (Exception e) {
            log.warn("DemoUserSeeder: could not create profile for {} – customer-service may not be up yet", username);
        }
    }
}
