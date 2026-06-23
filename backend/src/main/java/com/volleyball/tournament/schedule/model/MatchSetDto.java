package com.volleyball.tournament.schedule.model;

import jakarta.validation.constraints.Min;

public record MatchSetDto(
        int setNumber,
        @Min(0) int homePoints,
        @Min(0) int awayPoints) {
}
