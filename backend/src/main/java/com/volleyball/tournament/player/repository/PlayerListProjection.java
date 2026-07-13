package com.volleyball.tournament.player.repository;

import java.time.LocalDate;

/**
 * Flat, photo-bytes-free view of a player row for list/export use cases. Deliberately excludes
 * {@code photo_data} — loading every player's full photo blob into memory for a tournament-wide
 * list query is what caused production OutOfMemoryErrors on Render's free-tier heap. Only
 * {@code hasPhoto} (derived from the small photo_content_type column) is exposed; the actual
 * bytes are fetched separately per-player via the existing /players/{id}/photo endpoint.
 */
public interface PlayerListProjection {
    Long getId();
    Long getTournamentId();
    String getFirstName();
    String getMiddleName();
    String getLastName();
    String getPhone();
    String getEmail();
    String getAddressLine1();
    String getAddressLine2();
    String getAddressCity();
    String getAddressProvince();
    String getAddressPostalCode();
    String getAddressCountry();
    String getTshirtSize();
    String getEmergencyContactName();
    String getEmergencyContactPhone();
    String getSkillLevel();
    Integer getYearsExperience();
    Integer getJerseyNumberPreference();
    boolean isWaiverAccepted();
    boolean isPhotoConsent();
    String getDietaryNotes();
    String getGender();
    LocalDate getDateOfBirth();
    String getPaymentStatus();
    String getNotes();
    boolean isManualEntry();
    boolean isHasPhoto();
    String getApprovalStatus();
    String getRejectionReason();
}
