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
        String homeTshirtColor,
        Long awayTeamId,
        String awayTeamName,
        String awayTshirtColor,
        String bracketSlot,
        String status,
        Long winnerTeamId,
        int liveHomePoints,
        int liveAwayPoints,
        List<MatchSetDto> sets) {
}
