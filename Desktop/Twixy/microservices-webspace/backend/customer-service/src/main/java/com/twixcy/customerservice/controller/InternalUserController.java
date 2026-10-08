package com.twixcy.customerservice.controller;

import com.twixcy.customerservice.dto.*;
import com.twixcy.customerservice.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/** Service-to-service endpoints. Not routed by the API gateway, so browsers cannot reach them. */
@RestController
@RequestMapping("/internal/users")
public class InternalUserController {
    private final UserService userService;

    public InternalUserController(UserService userService) { this.userService = userService; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDTO create(@Valid @RequestBody CreateProfileRequest request) { return userService.createProfile(request); }

    @GetMapping("/batch")
    public List<UserDTO> batch(@RequestParam List<Long> ids) { return userService.batch(ids); }
}
