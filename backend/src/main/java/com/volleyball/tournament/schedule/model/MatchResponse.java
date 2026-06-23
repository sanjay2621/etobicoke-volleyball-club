package com.volleyball.tournament.schedule.model;

import java.time.LocalDateTime;
import java.util.List;

public record MatchResponse(
        Long id,
        String stage,
        String groupLabel,
        Integer roundNumber,
        Integer court,
        LocalDateTime scheduledStart,
        Long homeTeamId,
        String homeTeamName,
        Long awayTeamId,
        String awayTeamName,
        String bracketSlot,
        String status,
        Long winnerTeamId,
        List<MatchSetDto> sets) {
}
