package com.volleyball.tournament.team.model;

import java.util.List;

public record TeamResponse(
        Long id,
        Long tournamentId,
        String name,
        Long captainPlayerId,
        Long refereePlayerId,
        String groupLabel,
        int seed,
        int memberCount,
        String tshirtColor,
        List<TeamMemberView> members) {
}
