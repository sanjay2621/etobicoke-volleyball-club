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
     * {@code phone} already stripped to digits. Native query (rather than JPQL function()) to keep the
     * Postgres regexp_replace call unambiguous.
     */
    @Query(value = "SELECT * FROM player p WHERE "
            + "(CAST(:email AS text) IS NOT NULL AND LOWER(p.email) = LOWER(CAST(:email AS text))) OR "
            + "(CAST(:phone AS text) IS NOT NULL AND regexp_replace(p.phone, '\\D', '', 'g') = CAST(:phone AS text)) "
            + "ORDER BY p.created_at DESC",
            nativeQuery = true)
    List<Player> findMatchesForLookup(@Param("email") String email, @Param("phone") String phone, Pageable pageable);

    /**
     * Same rows as {@link #findByTournamentIdOrderByLastNameAscFirstNameAsc}, minus the photo_data
     * bytea column — used for list/export views that don't render raw photo bytes, to avoid pulling
     * every player's photo blob into memory in one ResultSet (see PlayerListProjection javadoc).
     */
    @Query(value = "SELECT "
            + "p.id AS id, p.tournament_id AS tournamentId, p.first_name AS firstName, "
            + "p.middle_name AS middleName, p.last_name AS lastName, p.phone AS phone, p.email AS email, "
            + "p.address_line1 AS addressLine1, p.address_line2 AS addressLine2, p.address_city AS addressCity, "
            + "p.address_province AS addressProvince, p.address_postal_code AS addressPostalCode, "
            + "p.address_country AS addressCountry, p.tshirt_size AS tshirtSize, "
            + "p.emergency_contact_name AS emergencyContactName, p.emergency_contact_phone AS emergencyContactPhone, "
            + "p.skill_level AS skillLevel, p.years_experience AS yearsExperience, "
            + "p.jersey_number_preference AS jerseyNumberPreference, p.waiver_accepted AS waiverAccepted, "
            + "p.photo_consent AS photoConsent, p.dietary_notes AS dietaryNotes, p.gender AS gender, "
            + "p.date_of_birth AS dateOfBirth, p.payment_status AS paymentStatus, p.notes AS notes, "
            + "p.manual_entry AS manualEntry, (p.photo_content_type IS NOT NULL) AS hasPhoto, "
            + "p.approval_status AS approvalStatus, p.rejection_reason AS rejectionReason "
            + "FROM player p WHERE p.tournament_id = :tournamentId AND p.deleted = false "
            + "ORDER BY p.last_name, p.first_name",
            nativeQuery = true)
    List<PlayerListProjection> findListRowsByTournamentId(@Param("tournamentId") Long tournamentId);

    /** Position rows for a batch of players, for assembling {@link PlayerListProjection} results. */
    @Query(value = "SELECT player_id, position FROM player_position WHERE player_id IN :playerIds",
            nativeQuery = true)
    List<Object[]> findPositionRowsForPlayerIds(@Param("playerIds") List<Long> playerIds);
}
