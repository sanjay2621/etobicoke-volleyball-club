package com.volleyball.tournament.team.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

/** A player's membership on a team. Hard-deleted on removal (rosters are mutable). */
@Getter
@Setter
@Entity
@Table(name = "team_member", uniqueConstraints = @UniqueConstraint(columnNames = {"team_id", "player_id"}))
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(name = "player_id", nullable = false)
    private Long playerId;

    /** Draft round in which the player was picked; null for manually-added members. */
    @Column(name = "draft_round")
    private Integer draftRound;
}
