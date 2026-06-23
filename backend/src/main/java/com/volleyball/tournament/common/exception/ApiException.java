package com.volleyball.tournament.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/** Base for application exceptions that map to a specific HTTP status. */
@Getter
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
}