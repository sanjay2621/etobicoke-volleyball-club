package com.volleyball.tournament.auth;

import java.util.Optional;

/**
 * Port that lets the auth module link an account to a player registration without depending
 * on the player module directly. The player module provides the real implementation;
 * a no-op fallback is used until then.
 */
public interface PlayerDirectory {

    /** Returns the id of an active player registration with this email, if one exists. */
    Optional<Long> findActivePlayerIdByEmail(String email);
}
