package com.volleyball.tournament.auth.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** A player who has already registered sets a password to create their login. */
public record RegisterAccountRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 100) String password) {
}
