package com.volleyball.tournament.team.model;

import java.util.List;

/** Slim, public-safe view of a team: roster names + photos only, with captain and referee flagged. */
public record PublicTeamResponse(
        Long id,
        String name,
        String groupLabel,
        int seed,
        String refereeName,
        List<PublicTeamMember> members) {

    public record PublicTeamMember(
            Long playerId,
            String fullName,
            String photoUrl,
            boolean captain) {
    }
}
