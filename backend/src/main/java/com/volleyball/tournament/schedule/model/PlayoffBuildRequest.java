package com.volleyball.tournament.schedule.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/**
 * Admin-defined playoff bracket: matches must be listed in dependency order (a match referencing
 * "W:QF1"/"L:QF1" must come after the match whose slot is "QF1").
 */
public record PlayoffBuildRequest(@NotEmpty @Valid List<PlayoffMatchRequest> matches) {
}
