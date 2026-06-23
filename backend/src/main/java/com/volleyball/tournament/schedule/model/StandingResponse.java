package com.volleyball.tournament.schedule.model;

import java.util.List;

public record StandingResponse(
        int rank,
        Long teamId,
        String teamName,
        int played,
        int wins,
        int losses,
        int setsWon,
        int setsLost,
        int pointsFor,
        int pointsAgainst,
        int pointDiff) {

    public record Group(String groupLabel, List<StandingResponse> rows) {
    }
}
