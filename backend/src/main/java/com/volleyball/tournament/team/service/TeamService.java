package com.volleyball.tournament.team.service;

import com.volleyball.tournament.common.exception.ApiException;
import com.volleyball.tournament.common.exception.NotFoundException;
import com.volleyball.tournament.player.entity.Player;
import com.volleyball.tournament.player.repository.PlayerRepository;
import com.volleyball.tournament.team.entity.Team;
import com.volleyball.tournament.team.entity.TeamMember;
import com.volleyball.tournament.team.model.AddMemberRequest;
import com.volleyball.tournament.team.model.CaptainRosterResponse;
import com.volleyball.tournament.team.model.PublicTeamResponse;
import com.volleyball.tournament.team.model.TeamMemberView;
import com.volleyball.tournament.team.model.TeamRequest;
import com.volleyball.tournament.team.model.TeamResponse;
import com.volleyball.tournament.team.repository.TeamMemberRepository;
import com.volleyball.tournament.team.repository.TeamRepository;
import com.volleyball.tournament.tournament.service.TournamentService;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final PlayerRepository playerRepository;
    private final TournamentService tournamentService;

    @Transactional(readOnly = true)
    public List<TeamResponse> listByTournament(Long tournamentId) {
        return teamRepository.findByTournamentIdOrderBySeedAscNameAsc(tournamentId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TeamResponse getById(Long id) {
        return toResponse(getEntity(id));
    }

    @Transactional(readOnly = true)
    public String exportCsv(Long tournamentId) {
        List<String> lines = new java.util.ArrayList<>();
        lines.add(com.volleyball.tournament.common.CsvUtil.row(
                "Team", "Group", "Seed", "Role", "Player", "Positions"));
        for (TeamResponse team : listByTournament(tournamentId)) {
            if (team.members().isEmpty()) {
                lines.add(com.volleyball.tournament.common.CsvUtil.row(
                        team.name(), team.groupLabel(), team.seed(), "", "(no players)", ""));
            }
            for (var m : team.members()) {
                String role = m.captain() ? "Captain" : (m.referee() ? "Referee" : "Player");
                lines.add(com.volleyball.tournament.common.CsvUtil.row(
                        team.name(), team.groupLabel(), team.seed(), role, m.fullName(),
                        m.preferredPositions().stream().map(Enum::name).sorted()
                                .collect(java.util.stream.Collectors.joining(" "))));
            }
        }
        return com.volleyball.tournament.common.CsvUtil.join(lines);
    }

    @Transactional
    public TeamResponse create(TeamRequest req) {
        tournamentService.getEntity(req.tournamentId());
        if (teamRepository.existsByTournamentIdAndNameIgnoreCase(req.tournamentId(), req.name().trim())) {
            throw new ApiException(HttpStatus.CONFLICT, "A team with this name already exists in this tournament");
        }
        Team team = new Team();
        team.setTournamentId(req.tournamentId());
        applyEditable(team, req);
        return toResponse(teamRepository.save(team));
    }

    @Transactional
    public TeamResponse update(Long id, TeamRequest req) {
        Team team = getEntity(id);
        if (teamRepository.existsByTournamentIdAndNameIgnoreCaseAndIdNot(team.getTournamentId(), req.name().trim(), id)) {
            throw new ApiException(HttpStatus.CONFLICT, "A team with this name already exists in this tournament");
        }
        applyEditable(team, req);
        return toResponse(teamRepository.save(team));
    }

    @Transactional
    public void delete(Long id) {
        Team team = getEntity(id);
        teamMemberRepository.deleteAll(teamMemberRepository.findByTeamId(id));
        team.setDeleted(true);
        teamRepository.save(team);
    }

    @Transactional
    public TeamResponse addMember(Long teamId, AddMemberRequest req) {
        Team team = getEntity(teamId);
        Player player = playerRepository.findById(req.playerId())
                .orElseThrow(() -> NotFoundException.of("Player", req.playerId()));
        if (!player.getTournamentId().equals(team.getTournamentId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Player belongs to a different tournament");
        }
        List<Long> teamIds = tournamentTeamIds(team.getTournamentId());
        if (teamMemberRepository.existsByPlayerIdAndTeamIdIn(player.getId(), teamIds)) {
            throw new ApiException(HttpStatus.CONFLICT, "Player is already on a team in this tournament");
        }
        TeamMember member = new TeamMember();
        member.setTeamId(teamId);
        member.setPlayerId(player.getId());
        member.setDraftRound(req.draftRound());
        teamMemberRepository.save(member);
        return toResponse(getEntity(teamId));
    }

    @Transactional
    public TeamResponse removeMember(Long teamId, Long playerId) {
        Team team = getEntity(teamId);
        teamMemberRepository.findByTeamIdAndPlayerId(teamId, playerId)
                .ifPresent(teamMemberRepository::delete);
        if (playerId.equals(team.getCaptainPlayerId())) {
            team.setCaptainPlayerId(null);
            teamRepository.save(team);
        }
        return toResponse(getEntity(teamId));
    }

    @Transactional
    public TeamResponse setCaptain(Long teamId, Long playerId) {
        Team team = getEntity(teamId);
        // Captain must be a member; add them if not already.
        if (teamMemberRepository.findByTeamIdAndPlayerId(teamId, playerId).isEmpty()) {
            addMember(teamId, new AddMemberRequest(playerId, null));
        }
        team.setCaptainPlayerId(playerId);
        return toResponse(teamRepository.save(team));
    }

    @Transactional
    public TeamResponse setTshirtColor(Long teamId, String color) {
        Team team = getEntity(teamId);
        team.setTshirtColor(color == null || color.isBlank() ? null : color);
        return toResponse(teamRepository.save(team));
    }

    @Transactional
    public TeamResponse setReferee(Long teamId, Long playerId) {
        Team team = getEntity(teamId);
        // Referee is a separate role and need not be a roster member.
        if (playerId != null) {
            Player player = playerRepository.findById(playerId)
                    .orElseThrow(() -> NotFoundException.of("Player", playerId));
            if (!player.getTournamentId().equals(team.getTournamentId())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Referee belongs to a different tournament");
            }
        }
        team.setRefereePlayerId(playerId);
        return toResponse(teamRepository.save(team));
    }

    @Transactional(readOnly = true)
    public TeamResponse getTeamForPlayer(Long playerId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> NotFoundException.of("Player", playerId));
        List<Long> teamIds = tournamentTeamIds(player.getTournamentId());
        TeamMember membership = teamMemberRepository.findFirstByPlayerIdAndTeamIdIn(playerId, teamIds)
                .orElseThrow(() -> new NotFoundException("You have not been assigned to a team yet"));
        return toResponse(getEntity(membership.getTeamId()));
    }

    /** Public roster view: team name + member names/photos + referee name. No contact info. */
    @Transactional(readOnly = true)
    public List<PublicTeamResponse> listPublicByTournament(Long tournamentId) {
        List<TeamResponse> teams = listByTournament(tournamentId);

        List<Long> refereeIds = teams.stream()
                .map(TeamResponse::refereePlayerId)
                .filter(id -> id != null)
                .distinct()
                .toList();
        Map<Long, String> refereeNames = playerRepository.findAllById(refereeIds).stream()
                .collect(java.util.stream.Collectors.toMap(
                        Player::getId, TeamService::fullName));

        return teams.stream()
                .map(t -> new PublicTeamResponse(
                        t.id(), t.name(), t.groupLabel(), t.seed(),
                        t.refereePlayerId() != null ? refereeNames.get(t.refereePlayerId()) : null,
                        t.members().stream()
                                .map(m -> new PublicTeamResponse.PublicTeamMember(
                                        m.playerId(), m.fullName(), m.photoUrl(), m.captain()))
                                .toList()))
                .toList();
    }

    /**
     * Captain-only roster with contact details. Resolves the caller's team via their playerId and
     * verifies they are that team's captain; otherwise 403.
     */
    @Transactional(readOnly = true)
    public CaptainRosterResponse getCaptainRoster(Long playerId) {
        Player caller = playerRepository.findById(playerId)
                .orElseThrow(() -> NotFoundException.of("Player", playerId));
        List<Long> teamIds = tournamentTeamIds(caller.getTournamentId());
        TeamMember membership = teamMemberRepository.findFirstByPlayerIdAndTeamIdIn(playerId, teamIds)
                .orElseThrow(() -> new NotFoundException("You have not been assigned to a team yet"));
        Team team = getEntity(membership.getTeamId());
        if (!playerId.equals(team.getCaptainPlayerId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the team captain can view the roster contact details");
        }

        List<TeamMember> members = teamMemberRepository.findByTeamId(team.getId());
        Map<Long, Player> players = players(members.stream().map(TeamMember::getPlayerId).toList());
        List<CaptainRosterResponse.CaptainRosterMember> views = members.stream()
                .filter(m -> players.containsKey(m.getPlayerId()))
                .map(m -> {
                    Player p = players.get(m.getPlayerId());
                    return new CaptainRosterResponse.CaptainRosterMember(
                            m.getPlayerId(),
                            fullName(p),
                            p.getPhotoData() != null ? "/api/players/" + p.getId() + "/photo" : null,
                            p.getPhone(),
                            p.getEmail(),
                            p.getSkillLevel(),
                            p.getPreferredPositions(),
                            m.getPlayerId().equals(team.getCaptainPlayerId()),
                            p.getPaymentStatus());
                })
                .sorted(Comparator.comparing(CaptainRosterResponse.CaptainRosterMember::captain).reversed()
                        .thenComparing(CaptainRosterResponse.CaptainRosterMember::fullName))
                .toList();

        return new CaptainRosterResponse(team.getId(), team.getName(), team.getGroupLabel(), views);
    }

    public Team getEntity(Long id) {
        return teamRepository.findById(id).orElseThrow(() -> NotFoundException.of("Team", id));
    }

    // --- helpers ---

    private void applyEditable(Team team, TeamRequest req) {
        team.setName(req.name());
        team.setCaptainPlayerId(req.captainPlayerId());
        team.setRefereePlayerId(req.refereePlayerId());
        team.setGroupLabel(req.groupLabel());
        if (req.seed() != null) {
            team.setSeed(req.seed());
        }
    }

    private List<Long> tournamentTeamIds(Long tournamentId) {
        return teamRepository.findByTournamentIdOrderBySeedAscNameAsc(tournamentId).stream()
                .map(Team::getId)
                .toList();
    }

    private TeamResponse toResponse(Team team) {
        List<TeamMember> members = teamMemberRepository.findByTeamId(team.getId());
        Map<Long, Player> players = players(members.stream().map(TeamMember::getPlayerId).toList());

        List<TeamMemberView> views = members.stream()
                .filter(m -> players.containsKey(m.getPlayerId()))
                .map(m -> {
                    Player p = players.get(m.getPlayerId());
                    return new TeamMemberView(
                            m.getPlayerId(),
                            fullName(p),
                            p.getPhotoData() != null ? "/api/players/" + p.getId() + "/photo" : null,
                            p.getPreferredPositions(),
                            m.getPlayerId().equals(team.getCaptainPlayerId()),
                            m.getPlayerId().equals(team.getRefereePlayerId()),
                            m.getDraftRound());
                })
                .sorted(Comparator.comparing(TeamMemberView::captain).reversed()
                        .thenComparing(TeamMemberView::fullName))
                .toList();

        return new TeamResponse(team.getId(), team.getTournamentId(), team.getName(),
                team.getCaptainPlayerId(), team.getRefereePlayerId(), team.getGroupLabel(),
                team.getSeed(), views.size(), team.getTshirtColor(), views);
    }

    private Map<Long, Player> players(List<Long> ids) {
        return playerRepository.findAllById(ids).stream()
                .collect(java.util.stream.Collectors.toMap(Player::getId, Function.identity()));
    }

    private static String fullName(Player p) {
        StringBuilder sb = new StringBuilder(p.getFirstName());
        if (p.getMiddleName() != null && !p.getMiddleName().isBlank()) {
            sb.append(' ').append(p.getMiddleName());
        }
        return sb.append(' ').append(p.getLastName()).toString();
    }
}
