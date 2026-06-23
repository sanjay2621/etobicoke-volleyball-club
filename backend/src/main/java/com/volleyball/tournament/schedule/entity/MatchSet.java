package com.volleyball.tournament.schedule.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "match_set", uniqueConstraints = @UniqueConstraint(columnNames = {"match_id", "set_number"}))
public class MatchSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "match_id", nullable = false)
    private Long matchId;

    @Column(name = "set_number", nullable = false)
    private int setNumber;

    @Column(name = "home_points", nullable = false)
    private int homePoints;

    @Column(name = "away_points", nullable = false)
    private int awayPoints;
}
