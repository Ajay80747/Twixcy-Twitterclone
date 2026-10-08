package com.twixcy.tweetservice.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AppConfig {

    @Bean
    @LoadBalanced
    public RestClient.Builder loadBalancedRestClientBuilder() {
        return RestClient.builder();
    }

    /**
     * Allow the Angular dev server (port 4200) to fetch images directly from tweet-service (port 8083).
     * This is only needed because images are served from tweet-service directly, not via the gateway.
     * The gateway already handles CORS for all /api/** calls, but /api/tweets/images/** calls
     * go directly to port 8083, so we need CORS here too.
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/tweets/images/**")
                        .allowedOrigins("http://localhost:4200")
                        .allowedMethods("GET")
                        .maxAge(3600);
                registry.addMapping("/api/tweets/upload-image")
                        .allowedOrigins("http://localhost:4200")
                        .allowedMethods("POST", "OPTIONS")
                        .allowedHeaders("*")
                        .maxAge(3600);
            }
        };
    }
}
