package com.ph.services;

import com.ph.repositories.UserRepository;
import com.ph.security.JwtService;
import com.ph.entities.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Auth service: password login + magic link forwarding to Supabase.
 */
@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private final String supabaseApiUrl;
    private final String supabaseApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuthService(UserRepository userRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder,
                       @Value("${supabase.url}") String supabaseApiUrl,
                       @Value("${supabase.key}") String supabaseApiKey) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.supabaseApiUrl = supabaseApiUrl != null ? supabaseApiUrl.replaceAll("/+$", "") : null;
        this.supabaseApiKey = supabaseApiKey;
    }

    public String authenticate(String email, String password) {
        try {
            Optional<User> optionalUser = userRepository.findByEmail(email);
            if (optionalUser.isEmpty()) {
                logger.debug("User not found: {}", email);
                throw new BadCredentialsException("Invalid email or password");
            }

            User user = optionalUser.get();

            if (!passwordEncoder.matches(password, user.getEncryptedPassword())) {
                logger.debug("Password mismatch for email: {}", email);
                throw new BadCredentialsException("Invalid email or password");
            }

            logger.info("Authentication succeeded for user: {}", user.getId());
            return jwtService.generateToken(user.getId().toString());

        } catch (BadCredentialsException ex) {
            throw ex;
        } catch (Exception ex) {
            logger.error("Unexpected error during authentication for email: {}", email, ex);
            throw new BadCredentialsException("Authentication failed due to internal error");
        }
    }

    /**
     * Convenience overload without redirect.
     */
    public void sendMagicLink(String email) {
        sendMagicLink(email, null);
    }

    /**
     * Forward magic link request to Supabase.
     * Sets Origin header to the supabase project URL to satisfy Supabase CORS checks.
     */
    public void sendMagicLink(String email, String redirectTo) {
        if (supabaseApiUrl == null || supabaseApiKey == null) {
            logger.error("Supabase configuration missing (supabase.url or supabase.key)");
            throw new RuntimeException("Supabase configuration missing");
        }

        String endpoint = supabaseApiUrl + "/auth/v1/otp";

        RestTemplate restTemplate = createSimpleRestTemplate(10000, 10000);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseApiKey);
        headers.set("Authorization", "Bearer " + supabaseApiKey);

        // Important: set Origin to the Supabase project URL to avoid "Invalid CORS request"
        headers.set("Origin", supabaseApiUrl);

        Map<String, Object> body = new HashMap<>();
        body.put("email", email);
        if (redirectTo != null && !redirectTo.isBlank()) {
            body.put("redirect_to", redirectTo);
        }

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            logger.info("Forwarding magic link request to Supabase for {}", email);
            ResponseEntity<String> response = restTemplate.postForEntity(URI.create(endpoint), request, String.class);

            int status = response.getStatusCodeValue();
            String respBody = response.getBody();
            logger.info("Supabase responded status={} body={}", status, respBody);

            if (!response.getStatusCode().is2xxSuccessful()) {
                String msg = "Supabase returned non-2xx: " + status + " body=" + respBody;
                logger.error(msg);
                throw new RuntimeException(msg);
            }

            // Check JSON body for embedded errors (Supabase sometimes returns JSON with error fields)
            if (respBody != null && !respBody.isBlank()) {
                try {
                    Map map = objectMapper.readValue(respBody, Map.class);
                    if (map.containsKey("error") || map.containsKey("msg") || map.containsKey("code")) {
                        Object err = map.getOrDefault("error", map.get("msg"));
                        if (err != null) {
                            String errMsg = "Supabase returned error in body: " + String.valueOf(err);
                            logger.error("{} fullBody={}", errMsg, respBody);
                            throw new RuntimeException(errMsg);
                        }
                    }
                } catch (JsonProcessingException e) {
                    // response not JSON — ignore parsing error
                }
            }

            logger.info("Magic link forwarded successfully for {}", email);
        } catch (RestClientException ex) {
            logger.error("Failed to forward magic link to Supabase for {}: {}", email, ex.getMessage(), ex);
            throw new RuntimeException("Magic link login failed: " + ex.getMessage(), ex);
        }
    }

    private RestTemplate createSimpleRestTemplate(int connectTimeoutMs, int readTimeoutMs) {
        org.springframework.http.client.SimpleClientHttpRequestFactory requestFactory =
                new org.springframework.http.client.SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(connectTimeoutMs);
        requestFactory.setReadTimeout(readTimeoutMs);
        return new RestTemplate(requestFactory);
    }
}
