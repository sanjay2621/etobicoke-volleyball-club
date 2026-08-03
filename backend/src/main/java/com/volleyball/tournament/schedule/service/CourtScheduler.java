package com.volleyball.tournament.schedule.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Greedy court + time-slot assignment. Packs matches across the available courts so that:
 *  - no team plays two matches in the same time slot,
 *  - at most {@code numberOfCourts} matches run in any one slot, and
 *  - a team is given at least one empty slot of rest since its last match, whenever a slot
 *    satisfying that exists -- back-to-back placement is only used as a last resort so every
 *    match still gets scheduled.
 * Returns slot/court assignments parallel to the input pairing list. Pure (no persistence).
 */
public final class CourtScheduler {

    private CourtScheduler() {
    }

    /** Zero-based time slot + 1-based court number for a match. */
    public record Slot(int slotIndex, int court) {
    }

    public static List<Slot> assign(List<Pairing> pairings, int numberOfCourts) {
        if (numberOfCourts < 1) {
            throw new IllegalArgumentException("numberOfCourts must be >= 1");
        }
        List<Set<Long>> teamsBusy = new ArrayList<>();
        List<Integer> courtsUsed = new ArrayList<>();
        List<Slot> result = new ArrayList<>();
        Map<Long, Integer> lastSlotForTeam = new HashMap<>();

        for (Pairing p : pairings) {
            // First try to find a slot with a rest gap since each team's previous match; if none
            // exists within a reasonable look-ahead, fall back to the plain earliest-feasible slot
            // (still never double-books a team or over-fills a court) so the match always lands.
            int slot = findSlot(teamsBusy, courtsUsed, numberOfCourts, p, lastSlotForTeam, true);
            if (slot < 0) {
                slot = findSlot(teamsBusy, courtsUsed, numberOfCourts, p, lastSlotForTeam, false);
            }
            int court = courtsUsed.get(slot) + 1;
            courtsUsed.set(slot, court);
            teamsBusy.get(slot).add(p.home());
            teamsBusy.get(slot).add(p.away());
            lastSlotForTeam.put(p.home(), slot);
            lastSlotForTeam.put(p.away(), slot);
            result.add(new Slot(slot, court));
        }
        return result;
    }

    /**
     * Earliest slot where both teams are free and a court is available. When
     * {@code avoidBackToBack} is true, also requires neither team's previous match to be in the
     * immediately preceding slot; gives up (returns -1) if that can't be satisfied within a bounded
     * look-ahead so the caller can retry without the constraint.
     */
    private static int findSlot(List<Set<Long>> teamsBusy, List<Integer> courtsUsed, int numberOfCourts,
                                 Pairing p, Map<Long, Integer> lastSlotForTeam, boolean avoidBackToBack) {
        int giveUpAfter = teamsBusy.size() + numberOfCourts * 2;
        for (int slot = 0; ; slot++) {
            ensureSlot(teamsBusy, courtsUsed, slot);
            Set<Long> busy = teamsBusy.get(slot);
            boolean teamFree = !busy.contains(p.home()) && !busy.contains(p.away());
            boolean courtFree = courtsUsed.get(slot) < numberOfCourts;
            if (teamFree && courtFree) {
                if (avoidBackToBack) {
                    boolean homeAdjacent = lastSlotForTeam.getOrDefault(p.home(), -2) == slot - 1;
                    boolean awayAdjacent = lastSlotForTeam.getOrDefault(p.away(), -2) == slot - 1;
                    if (homeAdjacent || awayAdjacent) {
                        if (slot >= giveUpAfter) {
                            return -1;
                        }
                        continue;
                    }
                }
                return slot;
            }
        }
    }

    private static void ensureSlot(List<Set<Long>> teamsBusy, List<Integer> courtsUsed, int slot) {
        while (teamsBusy.size() <= slot) {
            teamsBusy.add(new HashSet<>());
            courtsUsed.add(0);
        }
    }
}
