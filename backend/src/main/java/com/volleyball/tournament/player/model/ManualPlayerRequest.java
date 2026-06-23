package com.volleyball.tournament.player.model;

import com.volleyball.tournament.player.entity.Position;
import com.volleyball.tournament.player.entity.TshirtSize;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Set;

/** Admin-created player who never went through public registration. Most fields optional. */
public record ManualPlayerRequest(
        @NotNull Long tournamentId,
        @NotBlank String firstName,
        String middleName,
        @NotBlank String lastName,
        String phone,
        String email,
        Set<Position> preferredPositions,
        TshirtSize tshirtSize) {
}
