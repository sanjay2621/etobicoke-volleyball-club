package com.volleyball.tournament.schedule.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class RoundRobinTest {

    @Test
    void fiveTeamsEachPlayFourMatches() {
        List<Long> teams = List.of(1L, 2L, 3L, 4L, 5L);
        List<Pairing> pairings = RoundRobin.generate(teams);

        // 5 teams -> C(5,2) = 10 matches; each team plays 4.
        assertThat(pairings).hasSize(10);
        Map<Long, Integer> counts = countAppearances(pairings);
        assertThat(counts.values()).allMatch(c -> c == 4);
    }

    @Test
    void everyPairMeetsExactlyOnce() {
        List<Long> teams = List.of(1L, 2L, 3L, 4L);
        List<Pairing> pairings = RoundRobin.generate(teams);
        assertThat(pairings).hasSize(6); // C(4,2)

        Map<String, Integer> pairCounts = new HashMap<>();
        for (Pairing p : pairings) {
            long lo = Math.min(p.home(), p.away());
            long hi = Math.max(p.home(), p.away());
            pairCounts.merge(lo + "-" + hi, 1, Integer::sum);
        }
        assertThat(pairCounts).hasSize(6);
        assertThat(pairCounts.values()).allMatch(c -> c == 1);
    }

    @Test
    void noTeamPlaysItself() {
        List<Pairing> pairings = RoundRobin.generate(List.of(1L, 2L, 3L, 4L, 5L, 6L));
        assertThat(pairings).allMatch(p -> !p.home().equals(p.away()));
    }

    @Test
    void handlesTrivialCases() {
        assertThat(RoundRobin.generate(List.of())).isEmpty();
        assertThat(RoundRobin.generate(List.of(1L))).isEmpty();
        assertThat(RoundRobin.generate(List.of(1L, 2L))).hasSize(1);
    }

    private Map<Long, Integer> countAppearances(List<Pairing> pairings) {
        Map<Long, Integer> counts = new HashMap<>();
        for (Pairing p : pairings) {
            counts.merge(p.home(), 1, Integer::sum);
            counts.merge(p.away(), 1, Integer::sum);
        }
        return counts;
    }
}
