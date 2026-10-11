package com.twixcy.customerservice.controller;

import com.twixcy.customerservice.dto.*;
import com.twixcy.customerservice.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** The gateway validates the session and injects X-User-Id; it is the only source of caller identity. */
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) { this.userService = userService; }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> me(@RequestHeader("X-User-Id") Long currentUserId) {
        return ResponseEntity.ok(userService.getById(currentUserId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(userService.search(keyword));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<UserDTO>> suggestions(@RequestHeader("X-User-Id") Long currentUserId) {
        return ResponseEntity.ok(userService.suggestions(currentUserId));
    }

    @GetMapping("/batch")
    public ResponseEntity<List<UserDTO>> batch(@RequestParam List<Long> ids) {
        return ResponseEntity.ok(userService.batch(ids));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserDTO> byUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.getByUsername(username));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<UserDTO> byId(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<UserDTO> update(@PathVariable Long id, @RequestHeader("X-User-Id") Long currentUserId,
                                          @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.update(id, currentUserId, request));
    }
}
