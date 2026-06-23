package com.volleyball.tournament.player.model;

import com.volleyball.tournament.player.entity.PaymentStatus;
import com.volleyball.tournament.player.entity.Position;
import com.volleyball.tournament.player.entity.SkillLevel;
import com.volleyball.tournament.player.entity.TshirtSize;
import java.time.LocalDate;
import java.util.Set;

public record PlayerResponse(
        Long id,
        Long tournamentId,
        String firstName,
        String middleName,
        String lastName,
        String fullName,
        String phone,
        String email,
        String photoUrl,
        AddressDto address,
        Set<Position> preferredPositions,
        TshirtSize tshirtSize,
        String emergencyContactName,
        String emergencyContactPhone,
        SkillLevel skillLevel,
        Integer yearsExperience,
        Integer jerseyNumberPreference,
        boolean waiverAccepted,
        boolean photoConsent,
        String dietaryNotes,
        String gender,
        LocalDate dateOfBirth,
        PaymentStatus paymentStatus,
        String notes,
        boolean manualEntry,
        boolean hasAccount) {
}
