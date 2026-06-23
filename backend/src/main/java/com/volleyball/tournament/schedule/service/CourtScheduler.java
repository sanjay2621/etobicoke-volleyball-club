package com.volleyball.tournament.schedule.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Greedy court + time-slot assignment. Packs matches across the available courts so that:
 *  - no team plays two matches in the same time slot, and
 *  - at most {@code numberOfCourts} matches run in any one slot.
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

        for (Pairing p : pairings) {
            int slot = 0;
            while (true) {
                ensureSlot(teamsBusy, courtsUsed, slot);
                Set<Long> busy = teamsBusy.get(slot);
                boolean teamFree = !busy.contains(p.home()) && !busy.contains(p.away());
                boolean courtFree = courtsUsed.get(slot) < numberOfCourts;
                if (teamFree && courtFree) {
                    int court = courtsUsed.get(slot) + 1;
                    courtsUsed.set(slot, court);
                    busy.add(p.home());
                    busy.add(p.away());
                    result.add(new Slot(slot, court));
                    break;
                }
                slot++;
            }
        }
        return result;
    }

    private static void ensureSlot(List<Set<Long>> teamsBusy, List<Integer> courtsUsed, int slot) {
        while (teamsBusy.size() <= slot) {
            teamsBusy.add(new HashSet<>());
            courtsUsed.add(0);
        }
    }
}
