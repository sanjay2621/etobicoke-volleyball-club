package com.volleyball.tournament.team.entity;

import com.volleyball.tournament.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "team")
@SQLRestriction("deleted = false")
public class Team extends BaseEntity {

    @Column(name = "tournament_id", nullable = false)
    private Long tournamentId;

    @Column(nullable = false)
    private String name;

    @Column(name = "captain_player_id")
    private Long captainPlayerId;

    @Column(name = "referee_player_id")
    private Long refereePlayerId;

    /** Pool group: "A", "B", or null before group assignment. */
    @Column(name = "group_label", length = 4)
    private String groupLabel;

    /** Seeding within the tournament; drives group split + bracket placement. */
    @Column(nullable = false)
    private int seed = 0;

    @Column(name = "tshirt_color", length = 50)
    private String tshirtColor;
}
