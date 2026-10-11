package com.synccore.service;

import com.synccore.dto.LoginRequest;
import com.synccore.dto.LoginResponse;
import com.synccore.entity.User;
import com.synccore.exception.ResourceNotFoundException;
import com.synccore.repository.UserRepository;
import com.synccore.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest req) {
        // Throws BadCredentialsException (-> HTTP 401) if the username/password do not match the BCrypt hash
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        User user = userRepository.findByUsername(req.username())
                .orElseThrow(() -> new ResourceNotFoundException("User", 0L));
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return new LoginResponse(token, user.getUsername(), user.getRole().name());
    }
}
