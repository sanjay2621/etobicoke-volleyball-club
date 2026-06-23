package com.volleyball.tournament.draft.entity;

import com.volleyball.tournament.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "draft")
@SQLRestriction("deleted = false")
public class Draft extends BaseEntity {

    @Column(name = "tournament_id", nullable = false, unique = true)
    private Long tournamentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DraftStatus status = DraftStatus.NOT_STARTED;

    /** 1-based current round. */
    @Column(name = "current_round", nullable = false)
    private int currentRound = 1;

    /** Zero-based index of the next pick within the current round's order. */
    @Column(name = "current_pick_index", nullable = false)
    private int currentPickIndex = 0;

    /** Total rounds for this draft (derived from tournament roster config at start time). */
    @Column(name = "total_rounds", nullable = false)
    private int totalRounds = 0;
}
