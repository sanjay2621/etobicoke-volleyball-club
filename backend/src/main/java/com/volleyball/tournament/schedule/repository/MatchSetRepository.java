package com.volleyball.tournament.schedule.repository;

import com.volleyball.tournament.schedule.entity.MatchSet;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchSetRepository extends JpaRepository<MatchSet, Long> {

    List<MatchSet> findByMatchIdOrderBySetNumberAsc(Long matchId);

    List<MatchSet> findByMatchIdIn(List<Long> matchIds);

    void deleteByMatchId(Long matchId);
}
