package com.volleyball.tournament.schedule.model;

import jakarta.validation.constraints.NotBlank;

/**
 * One admin-defined playoff match. Either {@code homeTeamId}/{@code awayTeamId} is set directly
 * (a first-round match pulling straight from pool standings), or {@code homeSource}/{@code awaySource}
 * references an earlier slot in the same submitted bracket ("W:QF1" / "L:QF1") to be resolved once
 * that match completes.
 */
public record PlayoffMatchRequest(
        @NotBlank String stage,
        @NotBlank String slot,
        Long homeTeamId,
        Long awayTeamId,
        String homeSource,
        String awaySource) {
}
