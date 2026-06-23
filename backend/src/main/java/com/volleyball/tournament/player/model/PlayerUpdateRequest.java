package com.volleyball.tournament.player.model;

import com.volleyball.tournament.player.entity.PaymentStatus;
import com.volleyball.tournament.player.entity.Position;
import com.volleyball.tournament.player.entity.SkillLevel;
import com.volleyball.tournament.player.entity.TshirtSize;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.Set;

/** Admin edit payload. Photo is updated via a separate endpoint; payment status editable here. */
public record PlayerUpdateRequest(
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
        PaymentStatus paymentStatus,
        String dietaryNotes,
        String gender,
        LocalDate dateOfBirth,
        String notes) {
}
