package com.volleyball.tournament.player.repository;

import com.volleyball.tournament.player.entity.Player;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlayerRepository extends JpaRepository<Player, Long> {

    List<Player> findByTournamentIdOrderByLastNameAscFirstNameAsc(Long tournamentId);

    boolean existsByTournamentIdAndEmailIgnoreCase(Long tournamentId, String email);

    boolean existsByTournamentIdAndPhone(Long tournamentId, String phone);

    /** Most recent active registration for an email, used to link a login account. */
    Optional<Player> findFirstByEmailIgnoreCaseOrderByCreatedAtDesc(String email);
}
