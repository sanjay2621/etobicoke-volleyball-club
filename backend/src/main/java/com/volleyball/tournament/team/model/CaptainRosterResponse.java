package com.volleyball.tournament.team.model;

import com.volleyball.tournament.player.entity.Position;
import com.volleyball.tournament.player.entity.SkillLevel;
import java.util.List;
import java.util.Set;

/**
 * Richer roster view returned only to a team's captain: adds contact details, skill level, and
 * preferred positions on top of the public name/photo so the captain can organise their team.
 */
public record CaptainRosterResponse(
        Long teamId,
        String name,
        String groupLabel,
        List<CaptainRosterMember> members) {

    public record CaptainRosterMember(
            Long playerId,
            String fullName,
            String photoUrl,
            String phone,
            String email,
            SkillLevel skillLevel,
            Set<Position> preferredPositions,
            boolean captain) {
    }
}
