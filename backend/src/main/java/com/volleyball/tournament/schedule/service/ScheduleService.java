package com.volleyball.tournament.schedule.service;

import com.volleyball.tournament.common.exception.ApiException;
import com.volleyball.tournament.common.exception.NotFoundException;
import com.volleyball.tournament.schedule.entity.Match;
import com.volleyball.tournament.schedule.entity.MatchSet;
import com.volleyball.tournament.schedule.entity.MatchStage;
import com.volleyball.tournament.schedule.entity.MatchStatus;
import com.volleyball.tournament.schedule.model.MatchResponse;
import com.volleyball.tournament.schedule.model.MatchSetDto;
import com.volleyball.tournament.schedule.model.RecordResultRequest;
import com.volleyball.tournament.schedule.model.StandingResponse;
import com.volleyball.tournament.schedule.repository.MatchRepository;
import com.volleyball.tournament.schedule.repository.MatchSetRepository;
import com.volleyball.tournament.team.entity.Team;
import com.volleyball.tournament.team.repository.TeamRepository;
import com.volleyball.tournament.tournament.entity.Tournament;
import com.volleyball.tournament.tournament.entity.TournamentStatus;
import com.volleyball.tournament.tournament.service.TournamentService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final MatchRepository matchRepository;
    private final MatchSetRepository matchSetRepository;
    private final TeamRepository teamRepository;
    private final TournamentService tournamentService;

    // ---------- Pool generation ----------

    @Transactional
    public List<MatchResponse> generatePools(Long tournamentId) {
        Tournament tournament = tournamentService.getEntity(tournamentId);
        List<Team> teams = seedOrdered(tournamentId);
        if (teams.size() < 2) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "At least two teams are required to schedule");
        }

        // Snake split into groups A / B and persist on the teams.
        for (int i = 0; i < teams.size(); i++) {
            teams.get(i).setGroupLabel(snakeGroup(i));
        }
        teamRepository.saveAll(teams);

        clearAllMatches(tournamentId);

        // Round-robin per group, tagged with group label.
        record Tagged(Pairing pairing, String group) {
        }
        List<Tagged> tagged = new ArrayList<>();
        for (String group : List.of("A", "B")) {
            List<Long> groupTeamIds = teams.stream()
                    .filter(t -> group.equals(t.getGroupLabel()))
                    .map(Team::getId)
                    .toList();
            RoundRobin.generate(groupTeamIds).forEach(p -> tagged.add(new Tagged(p, group)));
        }
        tagged.sort(Comparator.comparingInt(t -> t.pairing().round()));

        List<Pairing> pairings = tagged.stream().map(Tagged::pairing).toList();
        List<CourtScheduler.Slot> slots = CourtScheduler.assign(pairings, tournament.getNumberOfCourts());

        LocalDateTime base = LocalDateTime.of(tournament.getDate(), tournament.getStartTime());
        long slotMinutes = (long) tournament.getPoolMatchDurationMinutes() + tournament.getBreakMinutes();

        for (int i = 0; i < pairings.size(); i++) {
            Pairing p = pairings.get(i);
            CourtScheduler.Slot slot = slots.get(i);
            Match m = new Match();
            m.setTournamentId(tournamentId);
            m.setStage(MatchStage.POOL);
            m.setGroupLabel(tagged.get(i).group());
            m.setRoundNumber(p.round());
            m.setCourt(slot.court());
            m.setScheduledStart(base.plusMinutes(slot.slotIndex() * slotMinutes));
            m.setHomeTeamId(p.home());
            m.setAwayTeamId(p.away());
            m.setStatus(MatchStatus.SCHEDULED);
            matchRepository.save(m);
        }

        tournament.setStatus(TournamentStatus.SCHEDULED);
        return getSchedule(tournamentId);
    }

    // ---------- Playoff generation ----------

    @Transactional
    public List<MatchResponse> generatePlayoffs(Long tournamentId) {
        Tournament tournament = tournamentService.getEntity(tournamentId);
        List<Match> pool = matchRepository.findByTournamentIdAndStage(tournamentId, MatchStage.POOL);
        if (pool.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Generate the pool schedule first");
        }
        if (pool.stream().anyMatch(m -> m.getStatus() != MatchStatus.COMPLETE)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "All pool matches must be completed first");
        }

        List<StandingResponse> groupA = standingsForGroup(tournamentId, "A");
        List<StandingResponse> groupB = standingsForGroup(tournamentId, "B");
        if (groupA.size() < 2 || groupB.size() < 2) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Each group needs at least two teams for playoffs");
        }

        // Remove any existing bracket matches before regenerating.
        for (MatchStage stage : List.of(MatchStage.SEMIFINAL, MatchStage.BRONZE, MatchStage.FINAL)) {
            matchRepository.findByTournamentIdAndStage(tournamentId, stage).forEach(m -> {
                matchSetRepository.deleteByMatchId(m.getId());
                matchRepository.delete(m);
            });
        }

        Long a1 = groupA.get(0).teamId();
        Long a2 = groupA.get(1).teamId();
        Long b1 = groupB.get(0).teamId();
        Long b2 = groupB.get(1).teamId();

        LocalDateTime lastStart = pool.stream()
                .map(Match::getScheduledStart)
                .filter(java.util.Objects::nonNull)
                .max(Comparator.naturalOrder())
                .orElse(LocalDateTime.of(tournament.getDate(), tournament.getStartTime()));
        long slotMinutes = (long) tournament.getPoolMatchDurationMinutes() + tournament.getBreakMinutes();
        LocalDateTime semiStart = lastStart.plusMinutes(slotMinutes);
        LocalDateTime medalStart = semiStart.plusMinutes(slotMinutes);

        saveBracket(tournamentId, MatchStage.SEMIFINAL, "SF1", a1, b2, null, null, 1, semiStart);
        saveBracket(tournamentId, MatchStage.SEMIFINAL, "SF2", b1, a2, null, null, 2, semiStart);
        saveBracket(tournamentId, MatchStage.BRONZE, "BRONZE", null, null, "L:SF1", "L:SF2", 1, medalStart);
        saveBracket(tournamentId, MatchStage.FINAL, "FINAL", null, null, "W:SF1", "W:SF2", 2, medalStart);

        tournament.setStatus(TournamentStatus.IN_PROGRESS);
        return getSchedule(tournamentId);
    }

    // ---------- Result entry ----------

    @Transactional
    public MatchResponse recordResult(Long matchId, RecordResultRequest req) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> NotFoundException.of("Match", matchId));
        if (match.getHomeTeamId() == null || match.getAwayTeamId() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Both teams must be set before recording a result");
        }

        matchSetRepository.deleteByMatchId(matchId);
        int homeSets = 0;
        int awaySets = 0;
        int setNo = 1;
        for (MatchSetDto dto : req.sets()) {
            MatchSet set = new MatchSet();
            set.setMatchId(matchId);
            set.setSetNumber(dto.setNumber() > 0 ? dto.setNumber() : setNo);
            set.setHomePoints(dto.homePoints());
            set.setAwayPoints(dto.awayPoints());
            matchSetRepository.save(set);
            if (dto.homePoints() > dto.awayPoints()) {
                homeSets++;
            } else if (dto.awayPoints() > dto.homePoints()) {
                awaySets++;
            }
            setNo++;
        }
        if (homeSets == awaySets) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A match cannot end tied — enter a decisive result");
        }

        Long winner = homeSets > awaySets ? match.getHomeTeamId() : match.getAwayTeamId();
        Long loser = homeSets > awaySets ? match.getAwayTeamId() : match.getHomeTeamId();
        match.setWinnerTeamId(winner);
        match.setStatus(MatchStatus.COMPLETE);
        matchRepository.save(match);

        if (match.getStage() == MatchStage.SEMIFINAL && match.getBracketSlot() != null) {
            propagateBracket(match.getTournamentId(), match.getBracketSlot(), winner, loser);
        }
        return toResponse(match, teamNames(match.getTournamentId()));
    }

    private void propagateBracket(Long tournamentId, String semiSlot, Long winner, Long loser) {
        for (Match m : matchRepository.findByTournamentIdAndStage(tournamentId, MatchStage.FINAL)) {
            applyFeeder(m, semiSlot, winner);
        }
        for (Match m : matchRepository.findByTournamentIdAndStage(tournamentId, MatchStage.BRONZE)) {
            applyFeeder(m, semiSlot, loser);
        }
    }

    /** Fills the home/away slot of a bracket match fed by the given semifinal. */
    private void applyFeeder(Match m, String semiSlot, Long teamId) {
        boolean changed = false;
        if (m.getHomeSource() != null && m.getHomeSource().endsWith(semiSlot)) {
            m.setHomeTeamId(teamId);
            changed = true;
        }
        if (m.getAwaySource() != null && m.getAwaySource().endsWith(semiSlot)) {
            m.setAwayTeamId(teamId);
            changed = true;
        }
        if (changed) {
            matchRepository.save(m);
        }
    }

    // ---------- Reads ----------

    @Transactional(readOnly = true)
    public List<MatchResponse> getSchedule(Long tournamentId) {
        Map<Long, String> names = teamNames(tournamentId);
        return matchRepository.findByTournamentIdOrderByScheduledStartAscCourtAsc(tournamentId).stream()
                .map(m -> toResponse(m, names))
                .toList();
    }

    @Transactional(readOnly = true)
    public String exportScheduleCsv(Long tournamentId) {
        List<String> lines = new java.util.ArrayList<>();
        lines.add(com.volleyball.tournament.common.CsvUtil.row(
                "Start", "Court", "Stage", "Group", "Home", "Away", "Status", "Score"));
        for (MatchResponse m : getSchedule(tournamentId)) {
            String score = m.sets().stream()
                    .map(s -> s.homePoints() + "-" + s.awayPoints())
                    .collect(java.util.stream.Collectors.joining(" "));
            lines.add(com.volleyball.tournament.common.CsvUtil.row(
                    m.scheduledStart(), m.court(), m.stage(), m.groupLabel(),
                    m.homeTeamName(), m.awayTeamName(), m.status(), score));
        }
        return com.volleyball.tournament.common.CsvUtil.join(lines);
    }

    @Transactional(readOnly = true)
    public List<StandingResponse.Group> getStandings(Long tournamentId) {
        List<StandingResponse.Group> groups = new ArrayList<>();
        for (String group : List.of("A", "B")) {
            List<StandingResponse> rows = standingsForGroup(tournamentId, group);
            if (!rows.isEmpty()) {
                groups.add(new StandingResponse.Group(group, rows));
            }
        }
        return groups;
    }

    private List<StandingResponse> standingsForGroup(Long tournamentId, String group) {
        List<Team> groupTeams = teamRepository.findByTournamentIdAndGroupLabel(tournamentId, group);
        if (groupTeams.isEmpty()) {
            return List.of();
        }
        List<Long> teamIds = groupTeams.stream().map(Team::getId).toList();
        Map<Long, String> names = groupTeams.stream()
                .collect(Collectors.toMap(Team::getId, Team::getName));

        List<Match> matches = matchRepository.findByTournamentIdAndStageAndGroupLabel(
                tournamentId, MatchStage.POOL, group);
        List<Long> matchIds = matches.stream().map(Match::getId).toList();
        Map<Long, List<MatchSet>> setsByMatch = matchIds.isEmpty() ? Map.of()
                : matchSetRepository.findByMatchIdIn(matchIds).stream()
                        .collect(Collectors.groupingBy(MatchSet::getMatchId));

        List<MatchResult> results = new ArrayList<>();
        for (Match m : matches) {
            if (m.getStatus() != MatchStatus.COMPLETE) {
                continue;
            }
            List<MatchSet> sets = setsByMatch.getOrDefault(m.getId(), List.of());
            int homeSets = 0;
            int awaySets = 0;
            int homePts = 0;
            int awayPts = 0;
            for (MatchSet s : sets) {
                homePts += s.getHomePoints();
                awayPts += s.getAwayPoints();
                if (s.getHomePoints() > s.getAwayPoints()) {
                    homeSets++;
                } else if (s.getAwayPoints() > s.getHomePoints()) {
                    awaySets++;
                }
            }
            results.add(new MatchResult(m.getHomeTeamId(), m.getAwayTeamId(), m.getWinnerTeamId(),
                    homeSets, awaySets, homePts, awayPts));
        }

        List<StandingRow> ranked = Standings.compute(teamIds, results);
        List<StandingResponse> out = new ArrayList<>();
        for (int i = 0; i < ranked.size(); i++) {
            StandingRow r = ranked.get(i);
            out.add(new StandingResponse(i + 1, r.teamId(), names.getOrDefault(r.teamId(), "?"),
                    r.played(), r.wins(), r.losses(), r.setsWon(), r.setsLost(),
                    r.pointsFor(), r.pointsAgainst(), r.pointDiff()));
        }
        return out;
    }

    // ---------- helpers ----------

    private void saveBracket(Long tournamentId, MatchStage stage, String slot, Long home, Long away,
                             String homeSource, String awaySource, int court, LocalDateTime start) {
        Match m = new Match();
        m.setTournamentId(tournamentId);
        m.setStage(stage);
        m.setBracketSlot(slot);
        m.setHomeTeamId(home);
        m.setAwayTeamId(away);
        m.setHomeSource(homeSource);
        m.setAwaySource(awaySource);
        m.setCourt(court);
        m.setScheduledStart(start);
        m.setStatus(MatchStatus.SCHEDULED);
        matchRepository.save(m);
    }

    private void clearAllMatches(Long tournamentId) {
        matchRepository.findByTournamentIdOrderByScheduledStartAscCourtAsc(tournamentId).forEach(m -> {
            matchSetRepository.deleteByMatchId(m.getId());
            matchRepository.delete(m);
        });
    }

    private List<Team> seedOrdered(Long tournamentId) {
        return teamRepository.findByTournamentIdOrderBySeedAscNameAsc(tournamentId).stream()
                .sorted(Comparator.comparingInt(Team::getSeed).thenComparing(Team::getId))
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private Map<Long, String> teamNames(Long tournamentId) {
        Map<Long, String> names = new LinkedHashMap<>();
        teamRepository.findByTournamentIdOrderBySeedAscNameAsc(tournamentId)
                .forEach(t -> names.put(t.getId(), t.getName()));
        return names;
    }

    private static String snakeGroup(int seedIndex) {
        int cycle = seedIndex % 4;
        return (cycle == 0 || cycle == 3) ? "A" : "B";
    }

    private MatchResponse toResponse(Match m, Map<Long, String> names) {
        List<MatchSetDto> sets = matchSetRepository.findByMatchIdOrderBySetNumberAsc(m.getId()).stream()
                .map(s -> new MatchSetDto(s.getSetNumber(), s.getHomePoints(), s.getAwayPoints()))
                .toList();
        return new MatchResponse(
                m.getId(), m.getStage().name(), m.getGroupLabel(), m.getRoundNumber(), m.getCourt(),
                m.getScheduledStart(),
                m.getHomeTeamId(), m.getHomeTeamId() == null ? labelFor(m.getHomeSource()) : names.get(m.getHomeTeamId()),
                m.getAwayTeamId(), m.getAwayTeamId() == null ? labelFor(m.getAwaySource()) : names.get(m.getAwayTeamId()),
                m.getBracketSlot(), m.getStatus().name(), m.getWinnerTeamId(), sets);
    }

    private static String labelFor(String source) {
        if (source == null) {
            return "TBD";
        }
        // "W:SF1" -> "Winner SF1", "L:SF2" -> "Loser SF2"
        String[] parts = source.split(":");
        if (parts.length == 2) {
            String prefix = parts[0].equals("W") ? "Winner " : "Loser ";
            return prefix + parts[1];
        }
        return "TBD";
    }
}
