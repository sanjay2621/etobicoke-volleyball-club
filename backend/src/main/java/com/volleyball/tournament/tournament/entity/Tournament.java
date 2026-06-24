package com.volleyball.tournament.tournament.entity;

import com.volleyball.tournament.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "tournament")
@SQLRestriction("deleted = false")
public class Tournament extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "tournament_date", nullable = false)
    private LocalDate date;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime = LocalTime.of(8, 0);

    private String venue;

    @Column(name = "number_of_courts", nullable = false)
    private int numberOfCourts = 4;

    @Column(name = "break_minutes", nullable = false)
    private int breakMinutes = 10;

    @Column(name = "pool_match_duration_minutes", nullable = false)
    private int poolMatchDurationMinutes = 20;

    @Column(name = "pool_sets_to_win", nullable = false)
    private int poolSetsToWin = 1;

    @Column(name = "pool_points_per_set", nullable = false)
    private int poolPointsPerSet = 25;

    @Column(name = "final_sets_to_win", nullable = false)
    private int finalSetsToWin = 2;

    @Column(name = "final_points_per_set", nullable = false)
    private int finalPointsPerSet = 15;

    /** Target players per team (incl. captain when captainCountsInRoster is true). */
    @Column(name = "target_roster_size", nullable = false)
    private int targetRosterSize = 6;

    @Column(name = "captain_counts_in_roster", nullable = false)
    private boolean captainCountsInRoster = true;

    @Column(name = "registration_open", nullable = false)
    private boolean registrationOpen = true;

    @Column(name = "registration_deadline")
    private LocalDate registrationDeadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TournamentStatus status = TournamentStatus.SETUP;

    /** Number of draft rounds derived from roster config. */
    public int draftRounds() {
        return captainCountsInRoster ? Math.max(0, targetRosterSize - 1) : targetRosterSize;
    }
}
