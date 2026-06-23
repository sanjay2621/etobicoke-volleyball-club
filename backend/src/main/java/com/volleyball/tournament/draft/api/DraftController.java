package com.volleyball.tournament.draft.api;

import com.volleyball.tournament.draft.model.DraftStateResponse;
import com.volleyball.tournament.draft.model.PickRequest;
import com.volleyball.tournament.draft.service.DraftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/draft")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DraftController {

    private final DraftService draftService;

    @GetMapping("/{tournamentId}/state")
    public DraftStateResponse state(@PathVariable Long tournamentId) {
        return draftService.state(tournamentId);
    }

    @PostMapping("/{tournamentId}/start")
    public DraftStateResponse start(@PathVariable Long tournamentId) {
        return draftService.start(tournamentId);
    }

    @PostMapping("/{tournamentId}/pick")
    public DraftStateResponse pick(@PathVariable Long tournamentId, @Valid @RequestBody PickRequest req) {
        return draftService.pick(tournamentId, req.playerId());
    }
}
