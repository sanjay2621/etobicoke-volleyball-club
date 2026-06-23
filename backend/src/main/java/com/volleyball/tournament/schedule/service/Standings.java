package com.volleyball.tournament.schedule.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Computes group standings from completed match results.
 * Tiebreakers (in order): wins, head-to-head (2-way), set differential, point differential, points-for.
 * Pure (no persistence) so it can be unit-tested directly.
 */
public final class Standings {

    private Standings() {
    }

    private static final class Acc {
        int played;
        int wins;
        int losses;
        int setsWon;
        int setsLost;
        int pointsFor;
        int pointsAgainst;
    }

    public static List<StandingRow> compute(List<Long> teamIds, List<MatchResult> results) {
        Map<Long, Acc> table = new HashMap<>();
        teamIds.forEach(id -> table.put(id, new Acc()));

        // winner of each direct meeting, keyed "a-b" with a<b -> winnerTeamId
        Map<String, Long> headToHead = new HashMap<>();

        for (MatchResult r : results) {
            Acc home = table.get(r.homeTeamId());
            Acc away = table.get(r.awayTeamId());
            if (home == null || away == null) {
                continue; // result involves a team outside this group
            }
            home.played++;
            away.played++;
            home.setsWon += r.homeSetsWon();
            home.setsLost += r.awaySetsWon();
            away.setsWon += r.awaySetsWon();
            away.setsLost += r.homeSetsWon();
            home.pointsFor += r.homePoints();
            home.pointsAgainst += r.awayPoints();
            away.pointsFor += r.awayPoints();
            away.pointsAgainst += r.homePoints();
            if (r.winnerTeamId() != null) {
                if (r.winnerTeamId().equals(r.homeTeamId())) {
                    home.wins++;
                    away.losses++;
                } else {
                    away.wins++;
                    home.losses++;
                }
                headToHead.put(key(r.homeTeamId(), r.awayTeamId()), r.winnerTeamId());
            }
        }

        List<StandingRow> rows = new ArrayList<>();
        teamIds.forEach(id -> {
            Acc a = table.get(id);
            rows.add(new StandingRow(id, a.played, a.wins, a.losses, a.setsWon, a.setsLost,
                    a.pointsFor, a.pointsAgainst));
        });

        rows.sort(comparator(headToHead));
        return rows;
    }

    private static Comparator<StandingRow> comparator(Map<String, Long> headToHead) {
        return (x, y) -> {
            if (x.wins() != y.wins()) {
                return Integer.compare(y.wins(), x.wins());
            }
            // 2-way head-to-head
            Long h2hWinner = headToHead.get(key(x.teamId(), y.teamId()));
            if (h2hWinner != null) {
                if (h2hWinner.equals(x.teamId())) {
                    return -1;
                }
                if (h2hWinner.equals(y.teamId())) {
                    return 1;
                }
            }
            int xSetDiff = x.setsWon() - x.setsLost();
            int ySetDiff = y.setsWon() - y.setsLost();
            if (xSetDiff != ySetDiff) {
                return Integer.compare(ySetDiff, xSetDiff);
            }
            if (x.pointDiff() != y.pointDiff()) {
                return Integer.compare(y.pointDiff(), x.pointDiff());
            }
            return Integer.compare(y.pointsFor(), x.pointsFor());
        };
    }

    private static String key(Long a, Long b) {
        long lo = Math.min(a, b);
        long hi = Math.max(a, b);
        return lo + "-" + hi;
    }
}
