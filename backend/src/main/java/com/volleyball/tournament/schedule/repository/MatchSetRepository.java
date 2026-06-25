package com.volleyball.tournament.schedule.repository;

import com.volleyball.tournament.schedule.entity.MatchSet;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MatchSetRepository extends JpaRepository<MatchSet, Long> {

    List<MatchSet> findByMatchIdOrderBySetNumberAsc(Long matchId);

    List<MatchSet> findByMatchIdIn(List<Long> matchIds);

    @Modifying
    @Query("DELETE FROM MatchSet ms WHERE ms.matchId = :matchId")
    void deleteByMatchId(@Param("matchId") Long matchId);
}
