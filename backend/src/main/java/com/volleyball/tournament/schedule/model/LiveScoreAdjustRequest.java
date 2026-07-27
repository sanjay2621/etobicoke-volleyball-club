package com.volleyball.tournament.schedule.model;

import jakarta.validation.constraints.NotBlank;

public record LiveScoreAdjustRequest(
        @NotBlank String side,
        int delta) {
}
