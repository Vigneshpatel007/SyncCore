package com.synccore.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

/**
 * Runs ONCE for EVERY request, before the controller.
 * 1. Read the header  "Authorization: Bearer <token>"
 * 2. Validate the token
 * 3. If valid, tell Spring Security "this request belongs to user X with role Y"
 * No database call and no session: the token itself carries the identity (= stateless).
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) { this.jwtUtil = jwtUtil; }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtUtil.isValid(token)) {
                Claims claims = jwtUtil.parse(token);
                // Spring expects role authorities to start with ROLE_  (hasRole('ADMIN') checks ROLE_ADMIN)
                var authority = new SimpleGrantedAuthority("ROLE_" + claims.get("role", String.class));
                var auth = new UsernamePasswordAuthenticationToken(claims.getSubject(), null, List.of(authority));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(request, response); // continue to the next filter / controller
    }
}
