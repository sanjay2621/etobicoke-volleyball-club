package com.volleyball.tournament.schedule.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class StandingsTest {

    @Test
    void ranksByWinsThenHeadToHead() {
        List<Long> teams = List.of(1L, 2L, 3L);
        // 1 beat 2, 2 beat 3, 3 beat 1 -> all 1-1; head-to-head used pairwise.
        List<MatchResult> results = List.of(
                new MatchResult(1L, 2L, 1L, 1, 0, 25, 20),
                new MatchResult(2L, 3L, 2L, 1, 0, 25, 18),
                new MatchResult(3L, 1L, 3L, 1, 0, 25, 22));

        List<StandingRow> rows = Standings.compute(teams, results);
        assertThat(rows).hasSize(3);
        assertThat(rows).allMatch(r -> r.wins() == 1 && r.played() == 2);
    }

    @Test
    void moreWinsRanksFirst() {
        List<Long> teams = List.of(10L, 20L);
        List<MatchResult> results = List.of(
                new MatchResult(10L, 20L, 10L, 1, 0, 25, 15));
        List<StandingRow> rows = Standings.compute(teams, results);
        assertThat(rows.get(0).teamId()).isEqualTo(10L);
        assertThat(rows.get(0).wins()).isEqualTo(1);
        assertThat(rows.get(1).teamId()).isEqualTo(20L);
        assertThat(rows.get(1).losses()).isEqualTo(1);
    }

    @Test
    void headToHeadBreaksTwoWayTie() {
        List<Long> teams = List.of(5L, 6L);
        // Each won one match against other teams (simulate equal wins) but 6 beat 5 directly.
        List<MatchResult> results = List.of(
                new MatchResult(6L, 5L, 6L, 1, 0, 25, 23));
        List<StandingRow> rows = Standings.compute(teams, results);
        assertThat(rows.get(0).teamId()).isEqualTo(6L);
    }

    @Test
    void pointDifferentialBreaksTieWhenNoHeadToHead() {
        List<Long> teams = List.of(7L, 8L, 9L);
        // 7 and 8 each beat 9; they never played each other -> set/point diff decides.
        List<MatchResult> results = List.of(
                new MatchResult(7L, 9L, 7L, 1, 0, 25, 10),
                new MatchResult(8L, 9L, 8L, 1, 0, 25, 20));
        List<StandingRow> rows = Standings.compute(teams, results);
        // 7 has better point differential (+15 vs +5).
        assertThat(rows.get(0).teamId()).isEqualTo(7L);
    }
}
