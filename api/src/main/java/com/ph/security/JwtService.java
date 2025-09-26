package com.ph.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT service for generating, parsing, and validating JWT tokens.
 * It also exposes utility methods for common checks.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms:3600000}") long expirationMs
    ) {
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException("jwt.secret is not set");
        }

        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(secret.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("jwt.secret is not valid Base64", e);
        }

        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    /**
     * Create a token with default extraClaims = empty.
     */
    public String generateToken(String subject) {
        return generateToken(Map.of(), subject);
    }

    /**
     * Build and sign JWT.
     */
    public String generateToken(Map<String, Object> extraClaims, String subject) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(new Date(now))
                .expiration(new Date(now + expirationMs))
                .signWith(key, Jwts.SIG.HS512)
                .compact();
    }

    /**
     * Extract subject (username) from token, returns null on invalid token.
     */
    public String extractUsername(String token) {
        return extractClaimSafe(token, Claims::getSubject);
    }

    /**
     * Extract expiration date from token, returns null on invalid token.
     */
    public Date extractExpiration(String token) {
        return extractClaimSafe(token, Claims::getExpiration);
    }

    /**
     * Wrapper that catches JwtException and returns null on failure.
     */
    private <T> T extractClaimSafe(String token, Function<Claims, T> claimsResolver) {
        try {
            return extractClaim(token, claimsResolver);
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }

    /**
     * Parse the token and return the requested claim value.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claimsResolver.apply(claims);
    }

    /**
     * Validate token integrity/expiration and ensure subject exists.
     * Returns true when token signature is valid, token not expired and subject present.
     */
    public boolean isTokenValid(String token) {
        if (token == null) return false;
        String sub = extractUsername(token);
        if (sub == null) return false;
        Date exp = extractExpiration(token);
        return exp != null && exp.after(new Date());
    }

    /**
     * Validate the token matches expected subject and not expired.
     */
    public boolean validateToken(String token, String expectedSubject) {
        try {
            if (!isTokenValid(token)) return false;
            String sub = extractUsername(token);
            return expectedSubject != null && expectedSubject.equals(sub);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Return the user id (subject) from an Authentication instance.
     * If authentication.getName() already contains a plain UUID string that is returned as-is.
     * If authentication.getName() contains a JWT string, we attempt to extract 'sub' from that token.
     * Throws IllegalArgumentException if subject cannot be resolved.
     */
    public String getUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Missing authentication or subject");
        }

        String raw = authentication.getName();

        // Heuristic: if the raw value looks like a JWT (contains at least two dots) try to extract sub
        if (raw.contains(".") && raw.split("\\.").length >= 3) {
            String sub = extractUsername(raw);
            if (sub == null || sub.isBlank()) {
                throw new IllegalArgumentException("Authentication name contains a token but sub could not be extracted");
            }
            return sub;
        }

        // Otherwise return raw (expected to be the UUID string)
        return raw;
    }

    private boolean isTokenExpired(String token) {
        Date exp = extractExpiration(token);
        return exp == null || exp.before(new Date());
    }
}
