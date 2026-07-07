package com.volleyball.tournament.player.repository;

import com.volleyball.tournament.player.entity.Player;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PlayerRepository extends JpaRepository<Player, Long> {

    List<Player> findByTournamentIdOrderByLastNameAscFirstNameAsc(Long tournamentId);

    boolean existsByTournamentIdAndEmailIgnoreCase(Long tournamentId, String email);

    boolean existsByTournamentIdAndPhone(Long tournamentId, String phone);

    /** Most recent active registration for an email, used to link a login account. */
    Optional<Player> findFirstByEmailIgnoreCaseOrderByCreatedAtDesc(String email);

    /**
     * Matches by email OR phone (either may be null), most recent first. Used for registration prefill
     * lookup. Phone comparison strips non-digits from the stored value so punctuation differences (e.g.
     * "(416)-555-1234" vs "4165551234") don't cause a false negative — the caller is expected to pass
     * {@code phone} already stripped to digits.
     */
    @Query("SELECT p FROM Player p WHERE "
            + "(:email IS NOT NULL AND LOWER(p.email) = LOWER(:email)) OR "
            + "(:phone IS NOT NULL AND function('regexp_replace', p.phone, '\\D', '', 'g') = :phone) "
            + "ORDER BY p.createdAt DESC")
    List<Player> findMatchesForLookup(@Param("email") String email, @Param("phone") String phone, Pageable pageable);
}
