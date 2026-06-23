package com.volleyball.tournament.schedule.repository;

import com.volleyball.tournament.schedule.entity.Match;
import com.volleyball.tournament.schedule.entity.MatchStage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchRepository extends JpaRepository<Match, Long> {

    List<Match> findByTournamentIdOrderByScheduledStartAscCourtAsc(Long tournamentId);

    List<Match> findByTournamentIdAndStage(Long tournamentId, MatchStage stage);

    List<Match> findByTournamentIdAndStageAndGroupLabel(Long tournamentId, MatchStage stage, String groupLabel);
}
