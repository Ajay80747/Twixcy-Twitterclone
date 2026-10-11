package com.twixcy.tweetservice.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Serves uploaded tweet images from the local filesystem.
 * Access: GET /api/tweets/images/{filename}
 * This is a public endpoint — no authentication required to view images.
 */
@RestController
@RequestMapping("/api/tweets/images")
public class ImageServeController {

    private final Path uploadDir;

    public ImageServeController(
            @Value("${twixcy.upload.dir:uploads/images}") String uploadDir) throws IOException {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath();
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<byte[]> serveImage(@PathVariable String filename) throws IOException {
        // Sanitize: prevent directory traversal
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid filename");
        }
        Path file = uploadDir.resolve(filename).normalize();
        if (!file.startsWith(uploadDir) || !Files.exists(file)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found");
        }
        String ct = Files.probeContentType(file);
        MediaType mediaType = ct != null ? MediaType.parseMediaType(ct) : MediaType.APPLICATION_OCTET_STREAM;
        return ResponseEntity.ok().contentType(mediaType).body(Files.readAllBytes(file));
    }
}
