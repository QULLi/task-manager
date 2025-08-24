
package com.ph.exception;

/** Thrown when an entity is not found or not owned by the caller. */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
}
