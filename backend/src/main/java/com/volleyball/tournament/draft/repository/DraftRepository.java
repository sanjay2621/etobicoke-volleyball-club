package com.volleyball.tournament.draft.repository;

import com.volleyball.tournament.draft.entity.Draft;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DraftRepository extends JpaRepository<Draft, Long> {

    Optional<Draft> findByTournamentId(Long tournamentId);
}
