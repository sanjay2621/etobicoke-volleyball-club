package com.volleyball.tournament.draft.model;

import jakarta.validation.constraints.NotNull;

public record PickRequest(@NotNull Long playerId) {
}
