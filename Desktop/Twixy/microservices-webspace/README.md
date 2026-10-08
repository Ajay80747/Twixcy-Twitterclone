# TWIXCY - Twitter Clone

Team **TWIXCY**: Yallavula Yashwanth, Gorakanti Ajay Kumar, B Vishnu Vardhan

A Twitter/X-style full-stack app built as independent Spring Boot microservices behind a Spring Cloud Gateway, with an Angular front end and MySQL (Hibernate/JPA) persistence.

## Technologies
Java 21, Spring Boot 3.5.x, Spring Cloud 2025.0.x (Eureka, Gateway, LoadBalancer), Spring Data JPA / Hibernate, MySQL 8, Maven, Angular 19 + TypeScript + HTML + CSS.

**Authentication constraint:** no JWT, no Spring Security, no BCrypt. Login uses a **database-backed session** in MySQL (see "Authentication flow"). Passwords are hashed with salted PBKDF2-HMAC-SHA256 (JDK only).

## Architecture
```
Angular :4200 -> API Gateway :8080 -> auth-service     :8081 -> twixcy_auth_db
                       |            -> customer-service :8082 -> twixcy_user_db
                       |            -> tweet-service    :8083 -> twixcy_tweet_db
                       |            -> follow-service   :8084 -> twixcy_follow_db
                  Eureka :8761 (service discovery for everything above)
```
Service-to-service REST (via Eureka names, `@LoadBalanced`):
- auth-service -> CUSTOMER-SERVICE `POST /internal/users` (creates the profile on register; rolled back if it fails)
- tweet-service -> CUSTOMER-SERVICE `GET /internal/users/batch` (author names) and FOLLOW-SERVICE `GET /internal/follows/following-ids/{id}` (feed)
- `/internal/**` endpoints are not routed by the gateway, so browsers cannot reach them.

## Folder structure
```
microservices-webspace/
|-- README.md
|-- database/create-databases.sql
|-- backend/
|   |-- eureka-server/      com.twixcy.eurekaserver
|   |-- api-gateway/        com.twixcy.apigateway (routes ,sessions)
|   |-- auth-service/       com.twixcy.authservice
|   |-- customer-service/   com.twixcy.customerservice
|   |-- tweet-service/      com.twixcy.tweetservice
|   `-- follow-service/     com.twixcy.followservice
`-- frontend/
    `-- twitter-clone-ui/   Angular app (core, auth, home, profile, tweet, users, followers, shared)
```
Each backend has `config, controller, dto, entity, exception, repository, service, security` packages and its own `pom.xml`.

## Ports
Eureka 8761, Gateway 8080, Auth 8081, Customer 8082, Tweet 8083, Follow 8084, Angular 4200, MySQL 3306.

## MySQL setup
```sql
CREATE DATABASE twixcy_auth_db;
CREATE DATABASE twixcy_user_db;
CREATE DATABASE twixcy_tweet_db;
CREATE DATABASE twixcy_follow_db;
```
(`database/create-databases.sql` has the same; the JDBC URLs also use `createDatabaseIfNotExist=true`.)
Hibernate creates tables (`ddl-auto=update`).

**Password:** every service reads `DB_USERNAME` (default `root`) and `DB_PASSWORD` (default placeholder `YOUR_PASSWORD`).
Set an environment variable (recommended) or edit `application.properties`:
- Windows: `setx DB_PASSWORD "yourpassword"` (restart the IDE/terminal)
- Eclipse/STS: Run Configurations -> Environment -> add `DB_PASSWORD`
- Linux/macOS: `export DB_PASSWORD=yourpassword`

## Database tables
| Database | Table | Columns |
|---|---|---|
| twixcy_auth_db | users | id, username (unique), email (unique), password (PBKDF2 hash), first_name, last_name, profile_image, bio, created_at, updated_at, enabled, role |
| twixcy_auth_db | user_sessions | id, token (unique), user_id, created_at, expires_at, revoked, revoked_at |
| twixcy_user_db | user_profiles | id, user_id (unique), username (unique), email, first_name, last_name, bio, profile_image, created_at, updated_at |
| twixcy_tweet_db | tweets | id, user_id, content (<=280), image_url, created_at, updated_at |
| twixcy_tweet_db | tweet_likes | id, tweet_id, user_id, created_at - UNIQUE(tweet_id, user_id) |
| twixcy_tweet_db | comments | id, tweet_id, user_id, content, created_at, updated_at |
| twixcy_follow_db | follows | id, follower_id, following_id, created_at - UNIQUE(follower_id, following_id) |

No cross-database relationships: services store plain `userId` values.

## Startup order
1. MySQL  2. Eureka  3. Auth  4. Customer  5. Tweet  6. Follow  7. API Gateway  8. Angular

```bash
cd backend/eureka-server      && mvn spring-boot:run     # http://localhost:8761
cd ../auth-service            && mvn spring-boot:run
cd ../customer-service        && mvn spring-boot:run
cd ../tweet-service           && mvn spring-boot:run
cd ../follow-service          && mvn spring-boot:run
cd ../api-gateway             && mvn spring-boot:run
cd ../../frontend/twitter-clone-ui && npm install && npm start     # http://localhost:4200
```
Open http://localhost:8761 and confirm AUTH-SERVICE, CUSTOMER-SERVICE, TWEET-SERVICE, FOLLOW-SERVICE and API-GATEWAY are UP (gateway/services take ~30-60 s to appear in each other's registry).
Build everything: `mvn clean install` in each backend folder (needs Maven 3.9+ and JDK 21). In Eclipse/STS: File -> Import -> Existing Maven Projects (select the `backend` folder). Maven wrapper files (`mvnw`) are not included; generate with `mvn wrapper:wrapper` if wanted.

## Authentication flow (database-backed sessions)
1. `POST /api/auth/register` - validates, stores user with PBKDF2-hashed password in `twixcy_auth_db`, creates the public profile in customer-service.
2. `POST /api/auth/login` - verifies the password, creates a row in `user_sessions` with a random 256-bit opaque token (24 h TTL, `twixcy.session.ttl-hours`), returns `{token, user}`.
3. Angular stores the token and an HttpInterceptor adds `Authorization: Bearer <token>` to every call to the gateway.
4. The gateway's `SessionAuthFilter` calls `GET /api/auth/validate` on every protected request, then forwards the verified identity as `X-User-Id` / `X-Username`. Any client-sent `X-User-Id` is discarded.
5. Downstream services take the caller from `X-User-Id` only (never from the request body) and enforce ownership (tweets, comments, profile) server-side.
6. `POST /api/auth/logout` - marks the session `revoked`; the token is rejected immediately afterwards (401), and Angular then clears local state and redirects to `/login`.

Note: the downstream service ports (8081-8084) trust the gateway's header. In production, keep them on a private network so only the gateway can reach them.

## REST API (all via http://localhost:8080)
Public: `POST /api/auth/register`, `POST /api/auth/login`. Everything else needs `Authorization: Bearer <token>`.

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/logout`, `GET /api/auth/validate` |
| Users | `GET /api/users/me`, `GET /api/users/{id}`, `GET /api/users/username/{username}`, `PUT /api/users/{id}` (own only), `GET /api/users/search?keyword=`, `GET /api/users/suggestions`, `GET /api/users/batch?ids=1,2` |
| Tweets | `POST /api/tweets`, `GET /api/tweets/{id}`, `GET /api/tweets/user/{userId}`, `GET /api/tweets/feed` (following + own), `GET /api/tweets/explore`, `PUT /api/tweets/{id}`, `DELETE /api/tweets/{id}` |
| Likes | `POST /api/tweets/{id}/like` (409 if already liked), `DELETE /api/tweets/{id}/like` |
| Comments | `POST /api/tweets/{id}/comment`, `GET /api/tweets/{id}/comments`, `PUT /api/comments/{id}`, `DELETE /api/comments/{id}` |
| Follows | `POST /api/follows/{userId}`, `DELETE /api/follows/{userId}`, `GET /api/follows/followers/{userId}`, `GET /api/follows/following/{userId}`, `GET /api/follows/status/{userId}`, `GET /api/follows/count/{userId}` |

Errors: `{"timestamp","status","message","path"}` (400 validation, 401, 403 not owner, 404, 409 duplicate).

## Testing the APIs
```bash
curl -X POST localhost:8080/api/auth/register -H 'Content-Type: application/json' \
  -d '{"username":"ajay","email":"ajay@gmail.com","password":"password","firstName":"Ajay","lastName":"Kumar"}'
curl -X POST localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{"email":"ajay@gmail.com","password":"password"}'
TOKEN=<token from login>
curl -X POST localhost:8080/api/tweets -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"content":"hello twixcy"}'
curl -X POST localhost:8080/api/auth/logout -H "Authorization: Bearer $TOKEN"
curl localhost:8080/api/tweets/explore -H "Authorization: Bearer $TOKEN"   # 401 after logout
```
Unit tests (Mockito, no database needed): `mvn test` in auth, customer, tweet and follow services.

**Test credentials:** none are seeded (no hardcoded users). Register through the UI at http://localhost:4200/register.

## Screenshots
Add screenshots of Login, Home, Profile and Search here.

## Future enhancements
Image upload, retweets, notifications, pagination/infinite scroll, refresh/expiry cleanup job for old sessions, rate limiting, Docker Compose, network-level isolation of internal services.
