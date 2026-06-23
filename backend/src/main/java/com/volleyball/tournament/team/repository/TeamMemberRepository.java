package com.volleyball.tournament.team.repository;

import com.volleyball.tournament.team.entity.TeamMember;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    List<TeamMember> findByTeamId(Long teamId);

    List<TeamMember> findByTeamIdIn(List<Long> teamIds);

    Optional<TeamMember> findByTeamIdAndPlayerId(Long teamId, Long playerId);

    Optional<TeamMember> findFirstByPlayerIdAndTeamIdIn(Long playerId, List<Long> teamIds);

    boolean existsByPlayerIdAndTeamIdIn(Long playerId, List<Long> teamIds);

    void deleteByPlayerId(Long playerId);
}
