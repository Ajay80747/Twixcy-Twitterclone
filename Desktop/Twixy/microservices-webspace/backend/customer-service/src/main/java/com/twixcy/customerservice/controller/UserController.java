package com.twixcy.customerservice.controller;

import com.twixcy.customerservice.dto.*;
import com.twixcy.customerservice.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/** The gateway validates the session and injects X-User-Id; it is the only source of caller identity. */
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) { this.userService = userService; }

    @GetMapping("/me")
    public UserDTO me(@RequestHeader("X-User-Id") Long currentUserId) { return userService.getById(currentUserId); }

    @GetMapping("/search")
    public List<UserDTO> search(@RequestParam String keyword) { return userService.search(keyword); }

    @GetMapping("/suggestions")
    public List<UserDTO> suggestions(@RequestHeader("X-User-Id") Long currentUserId) { return userService.suggestions(currentUserId); }

    @GetMapping("/batch")
    public List<UserDTO> batch(@RequestParam List<Long> ids) { return userService.batch(ids); }

    @GetMapping("/username/{username}")
    public UserDTO byUsername(@PathVariable String username) { return userService.getByUsername(username); }

    @GetMapping("/{id:\\d+}")
    public UserDTO byId(@PathVariable Long id) { return userService.getById(id); }

    @PutMapping("/{id:\\d+}")
    public UserDTO update(@PathVariable Long id, @RequestHeader("X-User-Id") Long currentUserId,
                          @Valid @RequestBody UpdateProfileRequest request) {
        return userService.update(id, currentUserId, request);
    }
}
