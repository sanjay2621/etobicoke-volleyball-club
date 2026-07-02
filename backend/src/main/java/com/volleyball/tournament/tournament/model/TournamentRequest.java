package com.volleyball.tournament.tournament.model;

import com.volleyball.tournament.tournament.entity.TournamentStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

/** Create/update payload for a tournament. Numeric fields default sensibly when omitted. */
public record TournamentRequest(
        @NotBlank String name,
        @NotNull LocalDate date,
        @NotNull LocalTime startTime,
        String venue,
        @Min(1) @Max(50) Integer numberOfCourts,
        @Min(0) @Max(60) Integer breakMinutes,
        @Min(5) @Max(120) Integer poolMatchDurationMinutes,
        @Min(1) @Max(3) Integer poolSetsToWin,
        @Min(1) @Max(99) Integer poolPointsPerSet,
        @Min(1) @Max(3) Integer finalSetsToWin,
        @Min(1) @Max(99) Integer finalPointsPerSet,
        @Min(2) @Max(20) Integer targetRosterSize,
        Boolean captainCountsInRoster,
        Boolean registrationOpen,
        LocalDate registrationDeadline,
        TournamentStatus status) {
}
