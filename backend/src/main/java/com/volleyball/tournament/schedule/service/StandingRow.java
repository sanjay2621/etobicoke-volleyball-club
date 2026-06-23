package com.volleyball.tournament.schedule.service;

public record StandingRow(
        Long teamId,
        int played,
        int wins,
        int losses,
        int setsWon,
        int setsLost,
        int pointsFor,
        int pointsAgainst) {

    public int pointDiff() {
        return pointsFor - pointsAgainst;
    }
}
