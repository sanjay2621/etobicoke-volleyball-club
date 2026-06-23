package com.volleyball.tournament.team.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TeamRequest(
        @NotNull Long tournamentId,
        @NotBlank String name,
        Long captainPlayerId,
        Long refereePlayerId,
        String groupLabel,
        Integer seed) {
}
