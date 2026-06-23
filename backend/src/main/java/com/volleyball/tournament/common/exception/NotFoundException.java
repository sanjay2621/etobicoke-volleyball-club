package com.volleyball.tournament.common.exception;

import org.springframework.http.HttpStatus;

/** Thrown when a requested resource does not exist (or is soft-deleted). Maps to 404. */
public class NotFoundException extends ApiException {

    public NotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }

    public static NotFoundException of(String entity, Object id) {
        return new NotFoundException(entity + " not found: " + id);
    }
}