package com.volleyball.tournament.player.model;

import jakarta.validation.constraints.NotNull;

public record CopyPlayerRequest(@NotNull Long targetTournamentId) {
}
