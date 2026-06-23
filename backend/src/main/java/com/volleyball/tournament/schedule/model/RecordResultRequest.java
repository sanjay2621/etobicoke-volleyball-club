package com.volleyball.tournament.schedule.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record RecordResultRequest(@NotEmpty @Valid List<MatchSetDto> sets) {
}
