package com.volleyball.tournament.draft.model;

import com.volleyball.tournament.player.model.PlayerResponse;
import com.volleyball.tournament.team.model.TeamResponse;
import java.util.List;

public record DraftStateResponse(
        Long tournamentId,
        String status,
        List<TeamResponse> teams,
        List<PlayerResponse> availablePlayers) {
}
