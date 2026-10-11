package com.synccore.exception;

/** Thrown when a business rule is broken (e.g. not enough stock). Becomes HTTP 400. */
public class BusinessException extends RuntimeException {
    public BusinessException(String message) { super(message); }
}
