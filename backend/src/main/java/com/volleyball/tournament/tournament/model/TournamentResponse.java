package com.volleyball.tournament.tournament.model;

import com.volleyball.tournament.tournament.entity.TournamentStatus;
import java.time.LocalDate;
import java.time.LocalTime;

public record TournamentResponse(
        Long id,
        String name,
        LocalDate date,
        LocalTime startTime,
        String venue,
        int numberOfCourts,
        int breakMinutes,
        int poolMatchDurationMinutes,
        int poolSetsToWin,
        int poolPointsPerSet,
        int finalSetsToWin,
        int finalPointsPerSet,
        int targetRosterSize,
        boolean captainCountsInRoster,
        int draftRounds,
        boolean registrationOpen,
        TournamentStatus status) {
}
