package com.volleyball.tournament.schedule.api;

import com.volleyball.tournament.schedule.model.MatchResponse;
import com.volleyball.tournament.schedule.model.RecordResultRequest;
import com.volleyball.tournament.schedule.model.StandingResponse;
import com.volleyball.tournament.schedule.service.ScheduleService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping("/schedule/{tournamentId}/generate-pools")
    @PreAuthorize("hasRole('ADMIN')")
    public List<MatchResponse> generatePools(@PathVariable Long tournamentId) {
        return scheduleService.generatePools(tournamentId);
    }

    @PostMapping("/schedule/{tournamentId}/generate-playoffs")
    @PreAuthorize("hasRole('ADMIN')")
    public List<MatchResponse> generatePlayoffs(@PathVariable Long tournamentId) {
        return scheduleService.generatePlayoffs(tournamentId);
    }

    /** Schedule is visible to any authenticated user (players see their matches too). */
    @GetMapping("/schedule/{tournamentId}")
    public List<MatchResponse> schedule(@PathVariable Long tournamentId) {
        return scheduleService.getSchedule(tournamentId);
    }

    @GetMapping("/standings/{tournamentId}")
    public List<StandingResponse.Group> standings(@PathVariable Long tournamentId) {
        return scheduleService.getStandings(tournamentId);
    }

    /** Public schedule + results for the home page (no auth). */
    @GetMapping("/schedule/public/{tournamentId}")
    public List<MatchResponse> publicSchedule(@PathVariable Long tournamentId) {
        return scheduleService.getSchedule(tournamentId);
    }

    /** Public standings / points table for the home page (no auth). */
    @GetMapping("/standings/public/{tournamentId}")
    public List<StandingResponse.Group> publicStandings(@PathVariable Long tournamentId) {
        return scheduleService.getStandings(tournamentId);
    }

    @GetMapping("/schedule/{tournamentId}/export")
    @PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<String> exportSchedule(@PathVariable Long tournamentId) {
        return org.springframework.http.ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"schedule-" + tournamentId + ".csv\"")
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv"))
                .body(scheduleService.exportScheduleCsv(tournamentId));
    }

    @PutMapping("/matches/{matchId}/result")
    @PreAuthorize("hasRole('ADMIN')")
    public MatchResponse recordResult(@PathVariable Long matchId, @Valid @RequestBody RecordResultRequest req) {
        return scheduleService.recordResult(matchId, req);
    }
}
