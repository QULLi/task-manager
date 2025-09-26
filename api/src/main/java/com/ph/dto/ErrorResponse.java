package com.ph.dto;

import lombok.Getter;

import java.time.Instant;

/** Minimal, stable error envelope for consistent API responses. */
@Getter
public class ErrorResponse {
    private final String message;
    private final String code;
    private final Instant timestamp;

    public ErrorResponse(String message, String code) {
        this.message = message;
        this.code = code;
        this.timestamp = Instant.now();
    }

}
