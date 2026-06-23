package com.volleyball.tournament.schedule.entity;

import com.volleyball.tournament.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "match_game")
@SQLRestriction("deleted = false")
public class Match extends BaseEntity {

    @Column(name = "tournament_id", nullable = false)
    private Long tournamentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private MatchStage stage;

    @Column(name = "group_label", length = 4)
    private String groupLabel;

    @Column(name = "round_number")
    private Integer roundNumber;

    @Column(name = "court")
    private Integer court;

    @Column(name = "scheduled_start")
    private LocalDateTime scheduledStart;

    /** Nullable until a bracket slot is resolved (e.g. FINAL before semifinals complete). */
    @Column(name = "home_team_id")
    private Long homeTeamId;

    @Column(name = "away_team_id")
    private Long awayTeamId;

    /** Slot label for bracket matches, e.g. "SF1", "SF2", "FINAL", "BRONZE". */
    @Column(name = "bracket_slot", length = 12)
    private String bracketSlot;

    /** Feeder slots for bracket propagation, e.g. winner of SF1 / loser of SF2. */
    @Column(name = "home_source", length = 24)
    private String homeSource;

    @Column(name = "away_source", length = 24)
    private String awaySource;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private MatchStatus status = MatchStatus.SCHEDULED;

    @Column(name = "winner_team_id")
    private Long winnerTeamId;
}
