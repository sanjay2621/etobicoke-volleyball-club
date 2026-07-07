package com.volleyball.tournament.player.model;

import com.volleyball.tournament.player.entity.Position;
import com.volleyball.tournament.player.entity.SkillLevel;
import com.volleyball.tournament.player.entity.TshirtSize;
import java.util.Set;

/**
 * Narrowed view of a previous registration for the public "prefill from a previous
 * tournament" flow. Deliberately excludes id/tournamentId/paymentStatus/notes/manualEntry/
 * hasAccount/waiverAccepted — this is served to an unauthenticated caller who only proved
 * knowledge of a phone number or email.
 */
public record PlayerLookupResponse(
        String firstName,
        String middleName,
        String lastName,
        String phone,
        String email,
        AddressDto address,
        Set<Position> preferredPositions,
        TshirtSize tshirtSize,
        String emergencyContactName,
        String emergencyContactPhone,
        SkillLevel skillLevel,
        boolean photoConsent,
        boolean hasPhoto) {
}
