package com.volleyball.tournament.team.model;

import jakarta.validation.constraints.NotNull;

public record AddMemberRequest(@NotNull Long playerId, Integer draftRound) {
}
