package com.twixcy.tweetservice.controller;

import com.twixcy.tweetservice.exception.InvalidRequestException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Handles image uploads for tweets.
 * Files are stored on the local filesystem and served back via /api/tweets/images/{filename}.
 * The returned URL is an absolute URL that Angular uses as imageUrl when posting a tweet.
 *
 * Allowed types: image/jpeg, image/png, image/webp, image/gif
 * Max size: 5 MB (configurable via twixcy.upload.max-size-mb)
 */
@RestController
@RequestMapping("/api/tweets")
public class ImageUploadController {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif");
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".jpg", ".jpeg", ".png", ".webp", ".gif");

    private final Path uploadDir;
    private final long maxBytes;
    private final String publicBaseUrl;

    public ImageUploadController(
            @Value("${twixcy.upload.dir:uploads/images}") String uploadDir,
            @Value("${twixcy.upload.max-size-mb:5}") int maxSizeMb,
            @Value("${twixcy.upload.public-base-url:http://localhost:8083}") String publicBaseUrl) throws IOException {
        this.uploadDir    = Paths.get(uploadDir).toAbsolutePath();
        this.maxBytes     = (long) maxSizeMb * 1024 * 1024;
        this.publicBaseUrl = publicBaseUrl.endsWith("/") ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1) : publicBaseUrl;
        Files.createDirectories(this.uploadDir);
    }

    /**
     * POST /api/tweets/upload-image
     * Requires Authorization header (gateway validates session and forwards X-User-Id).
     * Body: multipart/form-data, field name = "file"
     * Returns: { "url": "http://localhost:8083/api/tweets/images/abc123.jpg" }
     */
    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> uploadImage(
            @RequestHeader("X-User-Id") Long userId,
            @RequestPart("file") MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException("No file provided.");
        }

        // Size check
        if (file.getSize() > maxBytes) {
            throw new InvalidRequestException("Image size is too large. Maximum allowed size is " +
                    (maxBytes / 1024 / 1024) + " MB.");
        }

        // Content type check
        String contentType = file.getContentType() != null ? file.getContentType().toLowerCase() : "";
        if (!ALLOWED_TYPES.contains(contentType)) {
            throw new InvalidRequestException("Unsupported image format. Allowed: JPG, PNG, WEBP, GIF.");
        }

        // Extension check
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        String extension = "";
        int dotIdx = originalName.lastIndexOf('.');
        if (dotIdx >= 0) extension = originalName.substring(dotIdx);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new InvalidRequestException("Unsupported file extension. Allowed: .jpg, .jpeg, .png, .webp, .gif.");
        }

        // Save with a UUID filename to prevent collisions
        String filename = UUID.randomUUID().toString() + extension;
        Path destination = uploadDir.resolve(filename);
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        String url = publicBaseUrl + "/api/tweets/images/" + filename;
        return Map.of("url", url);
    }
}
