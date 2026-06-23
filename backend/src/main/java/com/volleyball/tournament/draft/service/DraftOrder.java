package com.volleyball.tournament.draft.service;

import java.util.ArrayList;
import java.util.List;

/**
 * Pure snake-draft ordering: round 1 follows the seed order, round 2 reverses it, and so on.
 * Kept free of persistence so it can be unit-tested in isolation.
 */
public final class DraftOrder {

    private DraftOrder() {
    }

    /** Team ids in pick order for a given 1-based round. */
    public static List<Long> orderForRound(List<Long> seedOrderedTeamIds, int round) {
        List<Long> order = new ArrayList<>(seedOrderedTeamIds);
        if (round % 2 == 0) {
            java.util.Collections.reverse(order);
        }
        return order;
    }

    /** The team that picks at a given round + zero-based index within that round. */
    public static Long teamOnTheClock(List<Long> seedOrderedTeamIds, int round, int pickIndex) {
        List<Long> order = orderForRound(seedOrderedTeamIds, round);
        if (pickIndex < 0 || pickIndex >= order.size()) {
            throw new IllegalArgumentException("pickIndex out of range: " + pickIndex);
        }
        return order.get(pickIndex);
    }
}
