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
 *  - a team never plays three or more consecutive slots in a row, if any slot avoiding that
 *    exists -- keeping every court filled each slot takes priority over spacing matches out, so a
 *    single back-to-back pair is used freely rather than leaving a court idle; only a third
 *    consecutive slot is avoided (and only as an absolute last resort, so every match still gets
 *    scheduled, is a longer run allowed).
 *
 * <p>Pairings are not necessarily assigned slots in increasing order (a later pairing can land in
 * an earlier gap than one processed before it), so consecutive-run checks are made against the
 * full set of a team's already-assigned slots, not just the most recently assigned one -- a
 * candidate slot can bridge two existing slots into a run just as easily as extend one.
 *
 * <p>Returns slot/court assignments parallel to the input pairing list. Pure (no persistence).
 */
public final class CourtScheduler {

    private CourtScheduler() {
    }

    /** Zero-based time slot + 1-based court number for a match. */
    public record Slot(int slotIndex, int court) {
    }

    private enum RestMode {
        /** A single back-to-back pair is fine, but never a run of three or more. */
        MAX_TWO_IN_A_ROW,
        /** No rest constraint -- last-resort fallback that always finds a slot. */
        ANY
    }

    public static List<Slot> assign(List<Pairing> pairings, int numberOfCourts) {
        if (numberOfCourts < 1) {
            throw new IllegalArgumentException("numberOfCourts must be >= 1");
        }
        List<Set<Long>> teamsBusy = new ArrayList<>();
        List<Integer> courtsUsed = new ArrayList<>();
        List<Slot> result = new ArrayList<>();
        Map<Long, Set<Integer>> slotsForTeam = new HashMap<>();

        for (Pairing p : pairings) {
            int slot = findSlot(teamsBusy, courtsUsed, numberOfCourts, p, slotsForTeam, RestMode.MAX_TWO_IN_A_ROW);
            if (slot < 0) {
                slot = findSlot(teamsBusy, courtsUsed, numberOfCourts, p, slotsForTeam, RestMode.ANY);
            }
            int court = courtsUsed.get(slot) + 1;
            courtsUsed.set(slot, court);
            teamsBusy.get(slot).add(p.home());
            teamsBusy.get(slot).add(p.away());
            slotsForTeam.computeIfAbsent(p.home(), k -> new HashSet<>()).add(slot);
            slotsForTeam.computeIfAbsent(p.away(), k -> new HashSet<>()).add(slot);
            result.add(new Slot(slot, court));
        }
        return result;
    }

    /**
     * Earliest slot where both teams are free and a court is available, satisfying the given rest
     * constraint; gives up (returns -1) if that can't be satisfied within a bounded look-ahead so
     * the caller can retry under a looser {@link RestMode}. {@code RestMode.ANY} never gives up.
     */
    private static int findSlot(List<Set<Long>> teamsBusy, List<Integer> courtsUsed, int numberOfCourts,
                                 Pairing p, Map<Long, Set<Integer>> slotsForTeam, RestMode mode) {
        int giveUpAfter = teamsBusy.size() + numberOfCourts * 2;
        for (int slot = 0; ; slot++) {
            ensureSlot(teamsBusy, courtsUsed, slot);
            Set<Long> busy = teamsBusy.get(slot);
            boolean teamFree = !busy.contains(p.home()) && !busy.contains(p.away());
            boolean courtFree = courtsUsed.get(slot) < numberOfCourts;
            if (teamFree && courtFree) {
                if (mode != RestMode.ANY
                        && (violatesRest(p.home(), slot, slotsForTeam, mode) || violatesRest(p.away(), slot, slotsForTeam, mode))) {
                    if (slot >= giveUpAfter) {
                        return -1;
                    }
                    continue;
                }
                return slot;
            }
        }
    }

    private static boolean violatesRest(Long team, int slot, Map<Long, Set<Integer>> slotsForTeam, RestMode mode) {
        Set<Integer> existing = slotsForTeam.getOrDefault(team, Set.of());
        boolean adjacent = existing.contains(slot - 1) || existing.contains(slot + 1);
        if (!adjacent) {
            return false;
        }
        // MAX_TWO_IN_A_ROW: only a problem if inserting here bridges/extends existing slots into a
        // run of three or more (scan both directions from the candidate, not just one neighbor).
        int run = 1;
        int left = slot - 1;
        while (existing.contains(left)) {
            run++;
            left--;
        }
        int right = slot + 1;
        while (existing.contains(right)) {
            run++;
            right++;
        }
        return run > 2;
    }

    private static void ensureSlot(List<Set<Long>> teamsBusy, List<Integer> courtsUsed, int slot) {
        while (teamsBusy.size() <= slot) {
            teamsBusy.add(new HashSet<>());
            courtsUsed.add(0);
        }
    }
}
