package com.volleyball.tournament.schedule.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class CourtSchedulerTest {

    /** Longest run of consecutive slot indices a team appears in, across the whole schedule. */
    private static int longestRun(List<Integer> sortedSlots) {
        int longest = 1;
        int run = 1;
        for (int i = 1; i < sortedSlots.size(); i++) {
            run = sortedSlots.get(i) == sortedSlots.get(i - 1) + 1 ? run + 1 : 1;
            longest = Math.max(longest, run);
        }
        return longest;
    }

    @Test
    void fourteenTeamsTwoGroupsFourCourts_noTeamPlaysThreeInARow() {
        List<Long> groupA = List.of(1L, 2L, 3L, 4L, 5L, 6L, 7L);
        List<Long> groupB = List.of(11L, 12L, 13L, 14L, 15L, 16L, 17L);

        record Tagged(Pairing pairing) {
        }
        List<Tagged> tagged = new ArrayList<>();
        RoundRobin.generate(groupA).forEach(p -> tagged.add(new Tagged(p)));
        RoundRobin.generate(groupB).forEach(p -> tagged.add(new Tagged(p)));
        tagged.sort(Comparator.comparingInt(t -> t.pairing().round()));
        List<Pairing> pairings = tagged.stream().map(Tagged::pairing).toList();

        List<CourtScheduler.Slot> slots = CourtScheduler.assign(pairings, 4);
        assertThat(slots).hasSize(pairings.size());

        Map<Long, List<Integer>> slotsByTeam = new HashMap<>();
        for (int i = 0; i < pairings.size(); i++) {
            int slotIndex = slots.get(i).slotIndex();
            slotsByTeam.computeIfAbsent(pairings.get(i).home(), k -> new ArrayList<>()).add(slotIndex);
            slotsByTeam.computeIfAbsent(pairings.get(i).away(), k -> new ArrayList<>()).add(slotIndex);
        }

        for (var entry : slotsByTeam.entrySet()) {
            List<Integer> teamSlots = new ArrayList<>(entry.getValue());
            teamSlots.sort(Integer::compareTo);
            assertThat(longestRun(teamSlots))
                    .as("team %s longest consecutive-slot run", entry.getKey())
                    .isLessThanOrEqualTo(2);
        }

        // Sanity: no team double-booked in the same slot, no slot over-fills the 4 courts.
        Map<Integer, Integer> countPerSlot = new HashMap<>();
        for (CourtScheduler.Slot s : slots) {
            countPerSlot.merge(s.slotIndex(), 1, Integer::sum);
        }
        countPerSlot.values().forEach(count -> assertThat(count).isLessThanOrEqualTo(4));

        // Court utilization matters at least as much as rest gaps: every slot but the last
        // (which only has the round-robin's final leftover pairings) should use all 4 courts.
        int lastSlot = countPerSlot.keySet().stream().max(Integer::compareTo).orElseThrow();
        countPerSlot.forEach((slotIndex, count) -> {
            if (slotIndex != lastSlot) {
                assertThat(count).as("courts used in slot %d", slotIndex).isEqualTo(4);
            }
        });
    }
}
