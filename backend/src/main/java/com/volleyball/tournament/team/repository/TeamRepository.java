package com.volleyball.tournament.team.repository;

import com.volleyball.tournament.team.entity.Team;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, Long> {

    List<Team> findByTournamentIdOrderBySeedAscNameAsc(Long tournamentId);

    List<Team> findByTournamentIdAndGroupLabel(Long tournamentId, String groupLabel);

    List<Team> findByCaptainPlayerId(Long playerId);

    List<Team> findByRefereePlayerId(Long playerId);

    boolean existsByTournamentIdAndNameIgnoreCase(Long tournamentId, String name);

    boolean existsByTournamentIdAndNameIgnoreCaseAndIdNot(Long tournamentId, String name, Long id);
}
