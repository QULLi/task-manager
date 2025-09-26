package com.ph.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

/**
 * Filter that validates JWT from Authorization header or HttpOnly cookie 'tm_token'.
 * If valid, populate SecurityContext with Authentication using UUID (token sub) as principal.
 */
public class SupabaseJwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(SupabaseJwtAuthenticationFilter.class);

    private final JwtService jwtService;

    public SupabaseJwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = null;
        final String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("tm_token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                // Validate token (signature + expiration)
                if (!jwtService.isTokenValid(token)) {
                    log.warn("SupabaseJwtAuthenticationFilter: token invalid or expired");
                } else {
                    // Extract subject (UUID)
                    String subject = jwtService.extractUsername(token);
                    if (subject == null || subject.isBlank()) {
                        log.warn("SupabaseJwtAuthenticationFilter: token has no subject");
                    } else {
                        var auth = new UsernamePasswordAuthenticationToken(
                                subject, // principal = UUID string (not the token)
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_USER"))
                        );
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        log.info("SupabaseJwtAuthenticationFilter: Authentication set for userId = {}", subject);
                    }
                }
            } catch (Exception ex) {
                log.error("SupabaseJwtAuthenticationFilter: failed to process token", ex);
            }
        }

        filterChain.doFilter(request, response);
    }
}
