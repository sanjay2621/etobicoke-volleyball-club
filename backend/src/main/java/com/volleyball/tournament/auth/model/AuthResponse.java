package com.volleyball.tournament.auth.model;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String email,
        String role,
        Long playerId) {
}
