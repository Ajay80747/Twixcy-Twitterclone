package com.twixcy.customerservice.controller;

import com.twixcy.customerservice.exception.InvalidRequestException;
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
 * Uploads profile images and banner images for user profiles.
 *
 * POST /api/users/upload-profile-image  -> returns { url: ... }
 * POST /api/users/upload-banner-image   -> returns { url: ... }
 *
 * Both require the caller to be authenticated (gateway injects X-User-Id).
 * Files are served publicly via /api/users/images/{filename}.
 */
@RestController
@RequestMapping("/api/users")
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
            @Value("${twixcy.upload.public-base-url:http://localhost:8080}") String publicBaseUrl) throws IOException {
        this.uploadDir    = Paths.get(uploadDir).toAbsolutePath();
        this.maxBytes     = (long) maxSizeMb * 1024 * 1024;
        this.publicBaseUrl = publicBaseUrl.endsWith("/") ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1) : publicBaseUrl;
        Files.createDirectories(this.uploadDir);
    }

    @PostMapping(value = "/upload-profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> uploadProfileImage(
            @RequestHeader("X-User-Id") Long userId,
            @RequestPart("file") MultipartFile file) throws IOException {
        return Map.of("url", saveAndBuildUrl(file));
    }

    @PostMapping(value = "/upload-banner-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> uploadBannerImage(
            @RequestHeader("X-User-Id") Long userId,
            @RequestPart("file") MultipartFile file) throws IOException {
        return Map.of("url", saveAndBuildUrl(file));
    }

    private String saveAndBuildUrl(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException("No file provided.");
        }
        if (file.getSize() > maxBytes) {
            throw new InvalidRequestException("Image size is too large. Maximum allowed size is " +
                    (maxBytes / 1024 / 1024) + " MB.");
        }
        String contentType = file.getContentType() != null ? file.getContentType().toLowerCase() : "";
        if (!ALLOWED_TYPES.contains(contentType)) {
            throw new InvalidRequestException("Unsupported image format. Allowed: JPG, PNG, WEBP, GIF.");
        }
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        String extension = "";
        int dotIdx = originalName.lastIndexOf('.');
        if (dotIdx >= 0) extension = originalName.substring(dotIdx);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new InvalidRequestException("Unsupported file extension. Allowed: .jpg, .jpeg, .png, .webp, .gif.");
        }
        String filename = UUID.randomUUID().toString() + extension;
        Path destination = uploadDir.resolve(filename);
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        return publicBaseUrl + "/api/users/images/" + filename;
    }
}
