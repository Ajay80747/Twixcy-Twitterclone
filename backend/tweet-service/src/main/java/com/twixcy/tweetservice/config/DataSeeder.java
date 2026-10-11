package com.twixcy.tweetservice.config;

import com.twixcy.tweetservice.entity.Comment;
import com.twixcy.tweetservice.entity.Tweet;
import com.twixcy.tweetservice.entity.TweetLike;
import com.twixcy.tweetservice.repository.CommentRepository;
import com.twixcy.tweetservice.repository.TweetLikeRepository;
import com.twixcy.tweetservice.repository.TweetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds sample tweets, likes and comments so the explore feed is never empty.
 * Runs once on startup and skips if data already exists.
 */
@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    // These user-IDs mirror the demo accounts created by the auth/customer seeder.
    // userId=1 → alice, userId=2 → bob, userId=3 → carol, userId=4 → dave
    private static final Long ALICE = 1L;
    private static final Long BOB   = 2L;
    private static final Long CAROL = 3L;
    private static final Long DAVE  = 4L;

    private final TweetRepository tweets;
    private final TweetLikeRepository likes;
    private final CommentRepository comments;

    public DataSeeder(TweetRepository tweets, TweetLikeRepository likes, CommentRepository comments) {
        this.tweets   = tweets;
        this.likes    = likes;
        this.comments = comments;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (tweets.count() > 0) {
            log.info("DataSeeder: tweets already present – skipping.");
            return;
        }
        log.info("DataSeeder: seeding sample tweets …");

        // ── Alice's tweets ────────────────────────────────────────────────
        Tweet t1 = save(ALICE, "Just deployed my first Spring Boot microservice! 🚀 " +
                "The feeling when all the Eureka instances light up green is unmatched. #SpringBoot #Microservices");

        Tweet t2 = save(ALICE, "Hot take: Angular's new signal-based reactivity is the biggest DX improvement " +
                "in frontend development this year. The zone-less future is finally here! #Angular #Frontend");

        Tweet t3 = save(ALICE, "Pro tip for MySQL: always add indexes on your foreign key columns. " +
                "Spent 3 hours debugging a slow query, turns out it was doing a full table scan. 😅 #MySQL #Database");

        // ── Bob's tweets ──────────────────────────────────────────────────
        Tweet t4 = save(BOB, "Working on TWIXCY — a Twitter clone built with Spring Cloud + Angular 19 + MySQL. " +
                "Real microservices: auth, users, tweets, follows — each with its own database! 💪");

        Tweet t5 = save(BOB, "Eureka service discovery is magical. Services just find each other by name. " +
                "No hardcoded ports, no configuration hell. Just lb://TWEET-SERVICE and you're done. 🎯 #SpringCloud");

        Tweet t6 = save(BOB, "If you're not using Spring Data JPA's derived query methods you're writing " +
                "too much boilerplate. findByUsernameContainingIgnoreCase does what it says on the tin. 🔥");

        // ── Carol's tweets ────────────────────────────────────────────────
        Tweet t7 = save(CAROL, "CSS tip of the day: use `backdrop-filter: blur()` for glassmorphism effects. " +
                "Combined with a semi-transparent background it looks stunning on dark UIs. ✨ #CSS #Design");

        Tweet t8 = save(CAROL, "Reminder: CORS errors in your browser are not a backend bug — they're a feature. " +
                "Your API gateway needs to explicitly allow your frontend origin. #WebDev #CORS");

        Tweet t9 = save(CAROL, "The API Gateway pattern is my favourite microservices pattern. " +
                "Single entry point, session validation, service routing, CORS handling — all in one place. 🏗️");

        // ── Dave's tweets ─────────────────────────────────────────────────
        Tweet t10 = save(DAVE, "Session tokens > JWT for internal microservice auth. " +
                "Revoke-on-logout actually works, no clock skew issues, and you can inspect active sessions in MySQL. #Security");

        Tweet t11 = save(DAVE, "Just joined TWIXCY! Really loving the clean Twitter-like UI. " +
                "The dark mode design is 🔥. Follow me for daily tech content! #NewHere");

        Tweet t12 = save(DAVE, "Opaque session tokens stored in MySQL: you get real-time revocation, " +
                "no token size bloat, and a simple audit log of all sessions. Trade-off: one extra DB call per request. Worth it.");

        // ── Likes ─────────────────────────────────────────────────────────
        like(BOB,   t1.getId()); like(CAROL, t1.getId()); like(DAVE,  t1.getId());
        like(ALICE, t4.getId()); like(CAROL, t4.getId());
        like(ALICE, t5.getId()); like(CAROL, t5.getId()); like(DAVE, t5.getId());
        like(BOB,   t7.getId()); like(ALICE, t7.getId());
        like(ALICE, t10.getId()); like(BOB,  t10.getId()); like(CAROL, t10.getId());
        like(CAROL, t2.getId()); like(DAVE, t2.getId());
        like(ALICE, t11.getId()); like(BOB, t11.getId());

        // ── Comments ──────────────────────────────────────────────────────
        comment(BOB,   t1.getId(), "Congrats Alice! What was the hardest part to get working?");
        comment(ALICE, t1.getId(), "Getting the Eureka client to register with the right service name. DNS lookup in Docker was fun 😅");
        comment(CAROL, t1.getId(), "The green Eureka dashboard never gets old 💚");

        comment(ALICE, t4.getId(), "Each service having its own DB is the key to real microservices independence. Great approach!");
        comment(DAVE,  t4.getId(), "Does the follow-service talk to tweet-service directly or via the gateway?");
        comment(BOB,   t4.getId(), "Via internal Eureka calls – the gateway is only for browser traffic @dave");

        comment(ALICE, t5.getId(), "lb:// prefix is doing so much heavy lifting behind the scenes. Spring Cloud LoadBalancer FTW!");
        comment(DAVE,  t5.getId(), "Agreed – combined with Ribbon or the new Spring Cloud LB it's incredibly smooth");

        comment(BOB,   t7.getId(), "That + CSS variables makes theming trivial. One change in :root = whole app updated ✨");
        comment(DAVE,  t7.getId(), "backdrop-filter has great browser support now. No more polyfills needed 🎉");

        comment(BOB,   t10.getId(), "The extra DB call is negligible at scale if you cache the session in Redis. Best of both worlds!");
        comment(ALICE, t10.getId(), "We went with MySQL sessions and it's been rock solid in prod");
        comment(CAROL, t10.getId(), "The audit log angle alone makes it worth it for enterprise apps");

        log.info("DataSeeder: seeded {} tweets successfully.", tweets.count());
    }

    private Tweet save(Long userId, String content) {
        Tweet t = new Tweet();
        t.setUserId(userId);
        t.setContent(content);
        return tweets.save(t);
    }

    private void like(Long userId, Long tweetId) {
        if (!likes.existsByTweetIdAndUserId(tweetId, userId)) {
            TweetLike l = new TweetLike();
            l.setUserId(userId);
            l.setTweetId(tweetId);
            likes.save(l);
        }
    }

    private void comment(Long userId, Long tweetId, String content) {
        Comment c = new Comment();
        c.setUserId(userId);
        c.setTweetId(tweetId);
        c.setContent(content);
        comments.save(c);
    }
}
