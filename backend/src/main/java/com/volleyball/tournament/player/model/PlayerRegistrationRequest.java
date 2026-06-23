package com.volleyball.tournament.player.model;

import com.volleyball.tournament.player.entity.Position;
import com.volleyball.tournament.player.entity.SkillLevel;
import com.volleyball.tournament.player.entity.TshirtSize;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.Set;

/** Public registration payload (sent as the JSON "data" part; photo is a separate file part). */
public record PlayerRegistrationRequest(
        @NotNull Long tournamentId,
        @NotBlank String firstName,
        String middleName,
        @NotBlank String lastName,
        @NotBlank String phone,
        @NotBlank @Email String email,
        @Valid AddressDto address,
        @NotNull @Size(min = 1, max = 2, message = "Select Referee only, or pick exactly two positions") Set<Position> preferredPositions,
        @NotNull TshirtSize tshirtSize,
        String emergencyContactName,
        String emergencyContactPhone,
        SkillLevel skillLevel,
        Integer yearsExperience,
        Integer jerseyNumberPreference,
        @AssertTrue(message = "You must accept the waiver") boolean waiverAccepted,
        boolean photoConsent,
        String dietaryNotes,
        String gender,
        LocalDate dateOfBirth,
        String notes) {
}
