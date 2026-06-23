package com.volleyball.tournament.common.exception;

import org.springframework.http.HttpStatus;

/** Thrown when a registration collides with an existing one (same email/phone in a tournament). Maps to 409. */
public class DuplicateRegistrationException extends ApiException {

    public DuplicateRegistrationException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
}