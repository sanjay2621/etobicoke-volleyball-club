package com.volleyball.tournament.draft.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.Test;

class DraftOrderTest {

    private final List<Long> seedOrder = List.of(1L, 2L, 3L, 4L);

    @Test
    void oddRoundsFollowSeedOrder() {
        assertThat(DraftOrder.orderForRound(seedOrder, 1)).containsExactly(1L, 2L, 3L, 4L);
        assertThat(DraftOrder.orderForRound(seedOrder, 3)).containsExactly(1L, 2L, 3L, 4L);
    }

    @Test
    void evenRoundsReverseSeedOrder() {
        assertThat(DraftOrder.orderForRound(seedOrder, 2)).containsExactly(4L, 3L, 2L, 1L);
        assertThat(DraftOrder.orderForRound(seedOrder, 4)).containsExactly(4L, 3L, 2L, 1L);
    }

    @Test
    void teamOnTheClockSnakesAcrossRounds() {
        // Round 1 first pick = top seed; round 2 first pick = bottom seed (snake).
        assertThat(DraftOrder.teamOnTheClock(seedOrder, 1, 0)).isEqualTo(1L);
        assertThat(DraftOrder.teamOnTheClock(seedOrder, 1, 3)).isEqualTo(4L);
        assertThat(DraftOrder.teamOnTheClock(seedOrder, 2, 0)).isEqualTo(4L);
        assertThat(DraftOrder.teamOnTheClock(seedOrder, 2, 3)).isEqualTo(1L);
    }

    @Test
    void rejectsOutOfRangeIndex() {
        assertThatThrownBy(() -> DraftOrder.teamOnTheClock(seedOrder, 1, 4))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
