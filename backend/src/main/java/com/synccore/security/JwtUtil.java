package com.synccore.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Creates and verifies JSON Web Tokens.
 * A JWT = header.payload.signature  (three Base64 parts joined by dots)
 *   payload  -> who the user is (username, role, expiry)
 *   signature-> HMAC-SHA256 of header+payload using OUR secret key
 * Anyone can READ a JWT, but nobody can CHANGE it without breaking the signature.
 */
@Component
public class JwtUtil {
    private final SecretKey key;
    private final long expirationMs;

    public JwtUtil(@Value("${app.jwt.secret}") String secret,
                   @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); // needs >= 32 characters
        this.expirationMs = expirationMs;
    }

    /** JWT generation: called once, after a successful login. */
    public String generateToken(String username, String role) {
        Date now = new Date();
        return Jwts.builder()
                .subject(username)                                   // "sub" claim
                .claim("role", role)                                 // custom claim
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))  // token dies automatically
                .signWith(key)                                       // sign with the secret
                .compact();
    }

    /** JWT validation: throws if the signature is wrong, the token is malformed or expired. */
    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
