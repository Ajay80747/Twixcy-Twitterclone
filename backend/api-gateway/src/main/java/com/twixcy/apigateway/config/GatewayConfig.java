package com.twixcy.apigateway.config;

import java.util.List;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class GatewayConfig {

    /** Routes resolve through Eureka (lb://SERVICE-NAME). */
    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-service", r -> r.path("/api/auth/**").uri("lb://AUTH-SERVICE"))
                .route("customer-service", r -> r.path("/api/users/**").uri("lb://CUSTOMER-SERVICE"))
                .route("tweet-service", r -> r.path("/api/tweets/**", "/api/comments/**").uri("lb://TWEET-SERVICE"))
                .route("follow-service", r -> r.path("/api/follows/**").uri("lb://FOLLOW-SERVICE"))
                .build();
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.addAllowedOrigin("http://localhost:4200");
        cors.addAllowedOriginPattern("http://localhost:4200");
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        cors.setAllowedHeaders(List.of("*"));
        cors.setExposedHeaders(List.of("*"));
        cors.setAllowCredentials(true);
        cors.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return new CorsWebFilter(source);
    }

    @Bean
    @LoadBalanced
    public WebClient.Builder loadBalancedWebClientBuilder() {
        return WebClient.builder();
    }
}
