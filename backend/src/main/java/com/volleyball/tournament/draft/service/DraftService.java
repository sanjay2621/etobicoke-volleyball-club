package com.volleyball.tournament.draft.service;

import com.volleyball.tournament.common.exception.ApiException;
import com.volleyball.tournament.common.exception.NotFoundException;
import com.volleyball.tournament.draft.entity.Draft;
import com.volleyball.tournament.draft.entity.DraftStatus;
import com.volleyball.tournament.draft.model.DraftStateResponse;
import com.volleyball.tournament.draft.repository.DraftRepository;
import com.volleyball.tournament.player.entity.Player;
import com.volleyball.tournament.player.model.PlayerResponse;
import com.volleyball.tournament.player.repository.PlayerRepository;
import com.volleyball.tournament.player.service.PlayerService;
import com.volleyball.tournament.team.entity.Team;
import com.volleyball.tournament.team.entity.TeamMember;
import com.volleyball.tournament.team.model.TeamResponse;
import com.volleyball.tournament.team.repository.TeamMemberRepository;
import com.volleyball.tournament.team.repository.TeamRepository;
import com.volleyball.tournament.team.service.TeamService;
import com.volleyball.tournament.tournament.entity.Tournament;
import com.volleyball.tournament.tournament.service.TournamentService;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DraftService {

    private final DraftRepository draftRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final PlayerRepository playerRepository;
    private final TournamentService tournamentService;
    private final TeamService teamService;
    private final PlayerService playerService;

    @Transactional
    public DraftStateResponse start(Long tournamentId) {
        Tournament tournament = tournamentService.getEntity(tournamentId);
        List<Team> teams = seedOrderedTeams(tournamentId);
        if (teams.size() < 2) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "At least two teams are required to draft");
        }
        boolean missingCaptain = teams.stream().anyMatch(t -> t.getCaptainPlayerId() == null);
        if (missingCaptain) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Every team must have a captain designated before the draft can start");
        }

        Draft draft = getOrCreateEntity(tournamentId);
        draft.setTotalRounds(tournament.draftRounds());
        draft.setCurrentRound(1);
        draft.setCurrentPickIndex(0);
        draft.setStatus(draft.getTotalRounds() <= 0 ? DraftStatus.COMPLETE : DraftStatus.IN_PROGRESS);
        draftRepository.save(draft);
        return state(tournamentId);
    }

    @Transactional
    public DraftStateResponse pick(Long tournamentId, Long playerId) {
        Draft draft = getEntity(tournamentId);
        if (draft.getStatus() != DraftStatus.IN_PROGRESS) {
            throw new ApiException(HttpStatus.CONFLICT, "Draft is not in progress");
        }
        List<Team> teams = seedOrderedTeams(tournamentId);
        List<Long> teamIds = teams.stream().map(Team::getId).toList();
        Long teamOnClock = DraftOrder.teamOnTheClock(teamIds, draft.getCurrentRound(), draft.getCurrentPickIndex());

        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> NotFoundException.of("Player", playerId));
        if (!player.getTournamentId().equals(tournamentId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Player belongs to a different tournament");
        }
        if (teamMemberRepository.existsByPlayerIdAndTeamIdIn(playerId, teamIds)) {
            throw new ApiException(HttpStatus.CONFLICT, "Player has already been drafted");
        }

        TeamMember member = new TeamMember();
        member.setTeamId(teamOnClock);
        member.setPlayerId(playerId);
        member.setDraftRound(draft.getCurrentRound());
        teamMemberRepository.save(member);

        advance(draft, teams.size());
        draftRepository.save(draft);
        return state(tournamentId);
    }

    @Transactional(readOnly = true)
    public DraftStateResponse state(Long tournamentId) {
        Draft draft = getOrCreateView(tournamentId);
        List<Team> teams = seedOrderedTeams(tournamentId);
        List<Long> teamIds = teams.stream().map(Team::getId).toList();

        Long onClockId = null;
        String onClockName = null;
        if (draft.getStatus() == DraftStatus.IN_PROGRESS && !teamIds.isEmpty()) {
            onClockId = DraftOrder.teamOnTheClock(teamIds, draft.getCurrentRound(), draft.getCurrentPickIndex());
            final Long fid = onClockId;
            onClockName = teams.stream().filter(t -> t.getId().equals(fid)).findFirst()
                    .map(Team::getName).orElse(null);
        }

        Set<Long> assigned = teamMemberRepository.findByTeamIdIn(teamIds).stream()
                .map(TeamMember::getPlayerId)
                .collect(Collectors.toSet());

        List<TeamResponse> teamResponses = teamService.listByTournament(tournamentId);
        List<PlayerResponse> available = playerService.listByTournament(tournamentId).stream()
                .filter(p -> !assigned.contains(p.id()))
                .toList();

        return new DraftStateResponse(tournamentId, draft.getStatus().name(),
                draft.getCurrentRound(), draft.getTotalRounds(), onClockId, onClockName,
                teamResponses, available);
    }

    private void advance(Draft draft, int teamsPerRound) {
        int nextIndex = draft.getCurrentPickIndex() + 1;
        if (nextIndex >= teamsPerRound) {
            draft.setCurrentPickIndex(0);
            draft.setCurrentRound(draft.getCurrentRound() + 1);
        } else {
            draft.setCurrentPickIndex(nextIndex);
        }
        if (draft.getCurrentRound() > draft.getTotalRounds()) {
            draft.setStatus(DraftStatus.COMPLETE);
        }
    }

    private List<Team> seedOrderedTeams(Long tournamentId) {
        return teamRepository.findByTournamentIdOrderBySeedAscNameAsc(tournamentId).stream()
                .sorted(Comparator.comparingInt(Team::getSeed).thenComparing(Team::getId))
                .toList();
    }

    private Draft getEntity(Long tournamentId) {
        return draftRepository.findByTournamentId(tournamentId)
                .orElseThrow(() -> new NotFoundException("No draft for tournament " + tournamentId));
    }

    private Draft getOrCreateEntity(Long tournamentId) {
        return draftRepository.findByTournamentId(tournamentId).orElseGet(() -> {
            Draft d = new Draft();
            d.setTournamentId(tournamentId);
            return d;
        });
    }

    /** Read path: returns a transient NOT_STARTED draft when none persisted yet. */
    private Draft getOrCreateView(Long tournamentId) {
        return draftRepository.findByTournamentId(tournamentId).orElseGet(() -> {
            Draft d = new Draft();
            d.setTournamentId(tournamentId);
            d.setStatus(DraftStatus.NOT_STARTED);
            return d;
        });
    }
}
