package com.synccore.exception;

import java.time.Instant;
import java.util.Map;

/** One consistent JSON shape for every error the API returns. */
public record ApiError(int status, String message, Map<String, String> errors, Instant timestamp) {
    public static ApiError of(int status, String message) { return new ApiError(status, message, null, Instant.now()); }
}
