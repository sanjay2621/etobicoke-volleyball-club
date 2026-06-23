package com.volleyball.tournament.schedule.service;

import java.util.ArrayList;
import java.util.List;

/**
 * Round-robin pairing generation via the circle method: every team plays every other team once.
 * For an odd number of teams a "bye" is introduced (one team sits out each round).
 * Pure (no persistence) so it can be unit-tested directly.
 */
public final class RoundRobin {

    private RoundRobin() {
    }

    public static List<Pairing> generate(List<Long> teamIds) {
        List<Long> teams = new ArrayList<>(teamIds);
        if (teams.size() < 2) {
            return List.of();
        }
        boolean odd = teams.size() % 2 != 0;
        if (odd) {
            teams.add(null); // bye marker
        }
        int n = teams.size();
        int rounds = n - 1;
        int half = n / 2;

        List<Pairing> pairings = new ArrayList<>();
        List<Long> arr = new ArrayList<>(teams);

        for (int r = 0; r < rounds; r++) {
            for (int i = 0; i < half; i++) {
                Long home = arr.get(i);
                Long away = arr.get(n - 1 - i);
                if (home != null && away != null) {
                    // Alternate home/away by round for fairness.
                    if (r % 2 == 0) {
                        pairings.add(new Pairing(r + 1, home, away));
                    } else {
                        pairings.add(new Pairing(r + 1, away, home));
                    }
                }
            }
            rotate(arr);
        }
        return pairings;
    }

    /** Rotate positions 1..n-1 clockwise, keeping position 0 fixed (standard circle method). */
    private static void rotate(List<Long> arr) {
        if (arr.size() < 3) {
            return;
        }
        Long last = arr.remove(arr.size() - 1);
        arr.add(1, last);
    }
}
