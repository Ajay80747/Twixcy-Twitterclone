package com.twixcy.apigateway.security;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Set;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Validates the opaque session token for every protected route and
 * forwards the verified identity to downstream services as X-User-Id / X-Username.
 * Any client-supplied X-User-Id header is always discarded.
 */
@Component
public class SessionAuthFilter implements GlobalFilter, Ordered {

    /** Fully-public paths — no token required at all. */
    private static final Set<String> PUBLIC_PATHS = Set.of(
            "/api/auth/register",
            "/api/auth/login"
    );

    /** Path prefixes that are also public (e.g. uploaded images). */
    private static final Set<String> PUBLIC_PREFIXES = Set.of(
            "/api/tweets/images/",
            "/api/users/images/"
    );

    private static final String USER_ID  = "X-User-Id";
    private static final String USERNAME = "X-Username";

    private final WebClient.Builder webClientBuilder;

    public SessionAuthFilter(@LoadBalanced WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path   = request.getURI().getPath();

        // Always strip client-injected identity headers
        ServerHttpRequest stripped = request.mutate()
                .headers(h -> { h.remove(USER_ID); h.remove(USERNAME); })
                .build();

        // Let CORS pre-flight and public paths pass through immediately
        if (HttpMethod.OPTIONS.equals(request.getMethod()) || PUBLIC_PATHS.contains(path)
                || PUBLIC_PREFIXES.stream().anyMatch(path::startsWith)) {
            return chain.filter(exchange.mutate().request(stripped).build());
        }

        String auth = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (auth == null || !auth.startsWith("Bearer ")) {
            return reject(exchange, HttpStatus.UNAUTHORIZED, "Missing or malformed Authorization header");
        }

        return webClientBuilder.build().get()
                .uri("http://AUTH-SERVICE/api/auth/validate")
                .header(HttpHeaders.AUTHORIZATION, auth)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .flatMap(session -> {
                    ServerHttpRequest verified = stripped.mutate().headers(h -> {
                        h.set(USER_ID,  String.valueOf(session.get("userId")));
                        h.set(USERNAME, String.valueOf(session.get("username")));
                    }).build();
                    return chain.filter(exchange.mutate().request(verified).build());
                })
                .onErrorResume(WebClientResponseException.class,
                        e -> reject(exchange, HttpStatus.UNAUTHORIZED, "Invalid, expired or revoked session"))
                .onErrorResume(WebClientRequestException.class,
                        e -> reject(exchange, HttpStatus.SERVICE_UNAVAILABLE, "Authentication service unavailable"));
    }

    private Mono<Void> reject(ServerWebExchange exchange, HttpStatus status, String message) {
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String json = "{\"status\":" + status.value() + ",\"message\":\"" + message + "\",\"path\":\""
                + exchange.getRequest().getURI().getPath() + "\"}";
        return exchange.getResponse().writeWith(
                Mono.just(exchange.getResponse().bufferFactory().wrap(json.getBytes(StandardCharsets.UTF_8))));
    }

    @Override
    public int getOrder() { return 10; }
}
