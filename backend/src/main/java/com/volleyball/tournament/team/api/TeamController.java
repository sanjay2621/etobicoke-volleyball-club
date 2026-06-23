package com.volleyball.tournament.team.api;

import com.volleyball.tournament.common.exception.ApiException;
import com.volleyball.tournament.security.AuthenticatedUser;
import com.volleyball.tournament.security.SecurityUtils;
import com.volleyball.tournament.team.model.AddMemberRequest;
import com.volleyball.tournament.team.model.CaptainRosterResponse;
import com.volleyball.tournament.team.model.PublicTeamResponse;
import com.volleyball.tournament.team.model.TeamRequest;
import com.volleyball.tournament.team.model.TeamResponse;
import com.volleyball.tournament.team.service.TeamService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    /** Current player's assigned team (or 404 if not yet drafted). */
    @GetMapping("/my")
    public TeamResponse myTeam() {
        AuthenticatedUser user = SecurityUtils.currentUser();
        if (user.playerId() == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "No player registration linked to this account");
        }
        return teamService.getTeamForPlayer(user.playerId());
    }

    /** Captain-only roster with contact details for the caller's own team. */
    @GetMapping("/my/roster")
    public CaptainRosterResponse myRoster() {
        AuthenticatedUser user = SecurityUtils.currentUser();
        if (user.playerId() == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "No player registration linked to this account");
        }
        return teamService.getCaptainRoster(user.playerId());
    }

    /** Public roster listing (name + photos only) for the home page. */
    @GetMapping("/public")
    public List<PublicTeamResponse> listPublic(@RequestParam Long tournamentId) {
        return teamService.listPublicByTournament(tournamentId);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<TeamResponse> list(@RequestParam Long tournamentId) {
        return teamService.listByTournament(tournamentId);
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<String> exportCsv(@RequestParam Long tournamentId) {
        return org.springframework.http.ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"teams-" + tournamentId + ".csv\"")
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv"))
                .body(teamService.exportCsv(tournamentId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TeamResponse get(@PathVariable Long id) {
        return teamService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public TeamResponse create(@Valid @RequestBody TeamRequest req) {
        return teamService.create(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TeamResponse update(@PathVariable Long id, @Valid @RequestBody TeamRequest req) {
        return teamService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        teamService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasRole('ADMIN')")
    public TeamResponse addMember(@PathVariable Long id, @Valid @RequestBody AddMemberRequest req) {
        return teamService.addMember(id, req);
    }

    @DeleteMapping("/{id}/members/{playerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public TeamResponse removeMember(@PathVariable Long id, @PathVariable Long playerId) {
        return teamService.removeMember(id, playerId);
    }

    @PutMapping("/{id}/captain/{playerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public TeamResponse setCaptain(@PathVariable Long id, @PathVariable Long playerId) {
        return teamService.setCaptain(id, playerId);
    }

    @PutMapping("/{id}/referee/{playerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public TeamResponse setReferee(@PathVariable Long id, @PathVariable Long playerId) {
        // playerId <= 0 clears the referee assignment.
        return teamService.setReferee(id, playerId == null || playerId <= 0 ? null : playerId);
    }
}
