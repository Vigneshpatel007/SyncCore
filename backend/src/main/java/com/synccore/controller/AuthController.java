package com.synccore.controller;

import com.synccore.dto.LoginRequest;
import com.synccore.dto.LoginResponse;
import com.synccore.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/** Controller = the front door. It only receives HTTP, calls a service, and returns JSON. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /** Who am I? Works only with a valid token. */
    @GetMapping("/me")
    public Map<String, Object> me(Authentication auth) {
        return Map.of("username", auth.getName(), "authorities", auth.getAuthorities().toString());
    }
}
