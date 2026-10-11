package com.twixcy.followservice.config;

import com.twixcy.followservice.entity.Follow;
import com.twixcy.followservice.repository.FollowRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds follow relationships so the "Following" feed works out-of-the-box.
 * alice↔bob, alice↔carol, bob↔carol, dave follows everyone.
 */
@Configuration
public class FollowSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(FollowSeeder.class);

    private static final Long ALICE = 1L, BOB = 2L, CAROL = 3L, DAVE = 4L;

    private final FollowRepository follows;

    public FollowSeeder(FollowRepository follows) { this.follows = follows; }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (follows.count() > 0) {
            log.info("FollowSeeder: follows already present – skipping.");
            return;
        }
        log.info("FollowSeeder: seeding follow relationships …");
        follow(ALICE, BOB);   follow(BOB,   ALICE);
        follow(ALICE, CAROL); follow(CAROL, ALICE);
        follow(BOB,   CAROL); follow(CAROL, BOB);
        follow(DAVE,  ALICE); follow(DAVE,  BOB); follow(DAVE, CAROL);
        log.info("FollowSeeder: done.");
    }

    private void follow(Long from, Long to) {
        if (!follows.existsByFollowerIdAndFollowingId(from, to)) {
            Follow f = new Follow();
            f.setFollowerId(from);
            f.setFollowingId(to);
            follows.save(f);
        }
    }
}
