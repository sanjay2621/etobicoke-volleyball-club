package com.volleyball.tournament.team.model;

import com.volleyball.tournament.player.entity.Position;
import java.util.Set;

public record TeamMemberView(
        Long playerId,
        String fullName,
        String photoUrl,
        Set<Position> preferredPositions,
        boolean captain,
        boolean referee,
        Integer draftRound) {
}
