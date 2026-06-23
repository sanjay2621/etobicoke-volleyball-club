package com.volleyball.tournament.schedule.service;

/** Flattened completed-match input for standings computation (decoupled from entities). */
public record MatchResult(
        Long homeTeamId,
        Long awayTeamId,
        Long winnerTeamId,
        int homeSetsWon,
        int awaySetsWon,
        int homePoints,
        int awayPoints) {
}
