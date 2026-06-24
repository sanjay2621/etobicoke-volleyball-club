package com.volleyball.tournament.tournament.service;

import com.volleyball.tournament.auth.repository.UserAccountRepository;
import com.volleyball.tournament.common.exception.NotFoundException;
import com.volleyball.tournament.player.entity.Player;
import com.volleyball.tournament.player.repository.PlayerRepository;
import com.volleyball.tournament.tournament.entity.Tournament;
import com.volleyball.tournament.tournament.entity.TournamentStatus;
import com.volleyball.tournament.tournament.mapper.TournamentMapper;
import com.volleyball.tournament.tournament.model.TournamentRequest;
import com.volleyball.tournament.tournament.model.TournamentResponse;
import com.volleyball.tournament.tournament.repository.TournamentRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final TournamentMapper tournamentMapper;
    private final PlayerRepository playerRepository;
    private final UserAccountRepository userAccountRepository;

    @Transactional(readOnly = true)
    public List<TournamentResponse> findAll() {
        return tournamentRepository.findAll(Sort.by(Sort.Direction.DESC, "date")).stream()
                .map(tournamentMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TournamentResponse findById(Long id) {
        return tournamentMapper.toResponse(getEntity(id));
    }

    public Tournament getEntity(Long id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> NotFoundException.of("Tournament", id));
    }

    @Transactional
    public TournamentResponse create(TournamentRequest req) {
        Tournament t = new Tournament();
        apply(t, req);
        return tournamentMapper.toResponse(tournamentRepository.save(t));
    }

    @Transactional
    public TournamentResponse update(Long id, TournamentRequest req) {
        Tournament t = getEntity(id);
        apply(t, req);
        return tournamentMapper.toResponse(tournamentRepository.save(t));
    }

    @Transactional
    public void delete(Long id) {
        Tournament t = getEntity(id);
        // Cascade cleanup: soft-delete the tournament's players and hard-delete their login
        // accounts so the registered emails are freed for future tournaments. Without this,
        // orphaned UserAccount rows (email is globally unique) block re-registration.
        List<Player> players = playerRepository.findByTournamentIdOrderByLastNameAscFirstNameAsc(id);
        for (Player p : players) {
            userAccountRepository.findByPlayerId(p.getId()).ifPresent(userAccountRepository::delete);
            p.setDeleted(true);
        }
        playerRepository.saveAll(players);
        t.setDeleted(true);
        tournamentRepository.save(t);
    }

    /** Copies request fields onto the entity, keeping existing/default values when a field is omitted. */
    private void apply(Tournament t, TournamentRequest req) {
        t.setName(req.name());
        t.setDate(req.date());
        t.setStartTime(req.startTime());
        t.setVenue(req.venue());
        t.setNumberOfCourts(orDefault(req.numberOfCourts(), t.getNumberOfCourts()));
        t.setBreakMinutes(orDefault(req.breakMinutes(), t.getBreakMinutes()));
        t.setPoolMatchDurationMinutes(orDefault(req.poolMatchDurationMinutes(), t.getPoolMatchDurationMinutes()));
        t.setPoolSetsToWin(orDefault(req.poolSetsToWin(), t.getPoolSetsToWin()));
        t.setPoolPointsPerSet(orDefault(req.poolPointsPerSet(), t.getPoolPointsPerSet()));
        t.setFinalSetsToWin(orDefault(req.finalSetsToWin(), t.getFinalSetsToWin()));
        t.setFinalPointsPerSet(orDefault(req.finalPointsPerSet(), t.getFinalPointsPerSet()));
        t.setTargetRosterSize(orDefault(req.targetRosterSize(), t.getTargetRosterSize()));
        t.setCaptainCountsInRoster(orDefault(req.captainCountsInRoster(), t.isCaptainCountsInRoster()));
        t.setRegistrationOpen(orDefault(req.registrationOpen(), t.isRegistrationOpen()));
        t.setRegistrationDeadline(req.registrationDeadline());
        t.setStatus(Optional.ofNullable(req.status()).orElse(t.getStatus() == null
                ? TournamentStatus.SETUP : t.getStatus()));
    }

    private static <T> T orDefault(T value, T fallback) {
        return value != null ? value : fallback;
    }
}
