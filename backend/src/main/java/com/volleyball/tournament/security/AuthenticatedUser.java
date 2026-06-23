package com.volleyball.tournament.security;

/** Lightweight principal stored in the SecurityContext after JWT validation. */
public record AuthenticatedUser(Long userId, Long playerId, String email, String role) {

    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }
}
