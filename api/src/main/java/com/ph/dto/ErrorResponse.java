package com.ph.dto;

import java.time.Instant;

/** Minimal, stable error envelope for consistent API responses. */
public class ErrorResponse {
    private final String message;
    private final String code;
    private final Instant timestamp;

    public ErrorResponse(String message, String code) {
        this.message = message;
        this.code = code;
        this.timestamp = Instant.now();
    }

    public String getMessage() { return message; }
    public String getCode() { return code; }
    public Instant getTimestamp() { return timestamp; }
}
