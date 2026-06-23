package com.volleyball.tournament.player.service;

import com.volleyball.tournament.auth.repository.UserAccountRepository;
import com.volleyball.tournament.common.exception.ApiException;
import com.volleyball.tournament.common.exception.DuplicateRegistrationException;
import com.volleyball.tournament.common.exception.NotFoundException;
import com.volleyball.tournament.common.storage.FileStorageService;
import com.volleyball.tournament.player.entity.Address;
import com.volleyball.tournament.player.entity.PaymentStatus;
import com.volleyball.tournament.player.entity.Player;
import com.volleyball.tournament.player.mapper.PlayerMapper;
import com.volleyball.tournament.player.model.AddressDto;
import com.volleyball.tournament.player.model.PlayerRegistrationRequest;
import com.volleyball.tournament.player.model.PlayerResponse;
import com.volleyball.tournament.player.model.PlayerUpdateRequest;
import com.volleyball.tournament.player.repository.PlayerRepository;
import com.volleyball.tournament.security.AuthenticatedUser;
import com.volleyball.tournament.security.SecurityUtils;
import com.volleyball.tournament.team.repository.TeamMemberRepository;
import com.volleyball.tournament.team.repository.TeamRepository;
import com.volleyball.tournament.tournament.entity.Tournament;
import com.volleyball.tournament.tournament.service.TournamentService;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final PlayerMapper playerMapper;
    private final FileStorageService fileStorageService;
    private final TournamentService tournamentService;
    private final UserAccountRepository userAccountRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;

    public record PhotoData(byte[] bytes, String contentType) {
    }

    @Transactional
    public PlayerResponse register(PlayerRegistrationRequest req, MultipartFile photo) {
        Tournament tournament = tournamentService.getEntity(req.tournamentId());
        if (!tournament.isRegistrationOpen()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Registration is closed for this tournament");
        }
        String email = req.email().trim();
        String phone = req.phone().trim();
        if (playerRepository.existsByTournamentIdAndEmailIgnoreCase(tournament.getId(), email)) {
            throw new DuplicateRegistrationException(
                    "A registration with this email already exists for this tournament");
        }
        if (playerRepository.existsByTournamentIdAndPhone(tournament.getId(), phone)) {
            throw new DuplicateRegistrationException(
                    "A registration with this phone number already exists for this tournament");
        }

        Player player = new Player();
        player.setTournamentId(tournament.getId());
        applyRegistration(player, req);

        if (photo != null && !photo.isEmpty()) {
            player.setPhotoPath(fileStorageService.storePhoto(photo, tournament.getId()));
        }

        Player saved = playerRepository.save(player);
        return toResponse(saved);
    }

    @Transactional
    public PlayerResponse createManual(com.volleyball.tournament.player.model.ManualPlayerRequest req) {
        tournamentService.getEntity(req.tournamentId());
        Player player = new Player();
        player.setTournamentId(req.tournamentId());
        player.setFirstName(req.firstName());
        player.setMiddleName(req.middleName());
        player.setLastName(req.lastName());
        player.setPhone(req.phone() == null ? "" : req.phone().trim());
        player.setEmail(req.email() == null ? "" : req.email().trim());
        if (req.preferredPositions() != null) {
            player.setPreferredPositions(new HashSet<>(req.preferredPositions()));
        }
        player.setTshirtSize(req.tshirtSize() == null
                ? com.volleyball.tournament.player.entity.TshirtSize.M : req.tshirtSize());
        player.setPaymentStatus(PaymentStatus.UNPAID);
        player.setManualEntry(true);
        return toResponse(playerRepository.save(player));
    }

    @Transactional(readOnly = true)
    public List<PlayerResponse> listByTournament(Long tournamentId) {
        return playerRepository.findByTournamentIdOrderByLastNameAscFirstNameAsc(tournamentId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public String exportCsv(Long tournamentId) {
        java.util.List<String> lines = new java.util.ArrayList<>();
        lines.add(com.volleyball.tournament.common.CsvUtil.row(
                "First", "Middle", "Last", "Phone", "Email", "Positions", "Shirt", "Skill",
                "Payment", "EmergencyName", "EmergencyPhone", "Waiver", "Manual", "HasAccount"));
        for (Player p : playerRepository.findByTournamentIdOrderByLastNameAscFirstNameAsc(tournamentId)) {
            lines.add(com.volleyball.tournament.common.CsvUtil.row(
                    p.getFirstName(), p.getMiddleName(), p.getLastName(), p.getPhone(), p.getEmail(),
                    p.getPreferredPositions().stream().map(Enum::name).sorted()
                            .collect(java.util.stream.Collectors.joining(" ")),
                    p.getTshirtSize(), p.getSkillLevel(), p.getPaymentStatus(),
                    p.getEmergencyContactName(), p.getEmergencyContactPhone(),
                    p.isWaiverAccepted() ? "Y" : "N", p.isManualEntry() ? "Y" : "N",
                    userAccountRepository.existsByPlayerId(p.getId()) ? "Y" : "N"));
        }
        return com.volleyball.tournament.common.CsvUtil.join(lines);
    }

    @Transactional(readOnly = true)
    public PlayerResponse getById(Long id) {
        Player player = getEntity(id);
        assertCanView(player);
        return toResponse(player);
    }

    @Transactional(readOnly = true)
    public PlayerResponse getCurrent() {
        AuthenticatedUser user = SecurityUtils.currentUser();
        if (user.playerId() == null) {
            throw new NotFoundException("No player registration is linked to this account");
        }
        return toResponse(getEntity(user.playerId()));
    }

    @Transactional
    public PlayerResponse update(Long id, PlayerUpdateRequest req) {
        Player player = getEntity(id);
        player.setFirstName(req.firstName());
        player.setMiddleName(req.middleName());
        player.setLastName(req.lastName());
        player.setPhone(req.phone().trim());
        player.setEmail(req.email().trim());
        player.setAddress(toAddress(req.address()));
        player.setPreferredPositions(new HashSet<>(req.preferredPositions()));
        player.setTshirtSize(req.tshirtSize());
        player.setEmergencyContactName(req.emergencyContactName());
        player.setEmergencyContactPhone(req.emergencyContactPhone());
        player.setSkillLevel(req.skillLevel());
        player.setYearsExperience(req.yearsExperience());
        player.setJerseyNumberPreference(req.jerseyNumberPreference());
        player.setPaymentStatus(req.paymentStatus() == null ? player.getPaymentStatus() : req.paymentStatus());
        player.setDietaryNotes(req.dietaryNotes());
        player.setGender(req.gender());
        player.setDateOfBirth(req.dateOfBirth());
        player.setNotes(req.notes());
        return toResponse(playerRepository.save(player));
    }

    @Transactional
    public void delete(Long id) {
        Player player = getEntity(id);
        Long playerId = player.getId();
        // Free the email for re-registration.
        userAccountRepository.findByPlayerId(playerId).ifPresent(userAccountRepository::delete);
        // Remove from any team rosters.
        teamMemberRepository.deleteByPlayerId(playerId);
        // Clear captain/referee slots so teams don't reference a deleted player.
        teamRepository.findByCaptainPlayerId(playerId).forEach(t -> {
            t.setCaptainPlayerId(null);
            teamRepository.save(t);
        });
        teamRepository.findByRefereePlayerId(playerId).forEach(t -> {
            t.setRefereePlayerId(null);
            teamRepository.save(t);
        });
        player.setDeleted(true);
        playerRepository.save(player);
    }

    @Transactional(readOnly = true)
    public PhotoData getPhoto(Long id) {
        Player player = getEntity(id);
        if (player.getPhotoPath() == null) {
            throw new NotFoundException("No photo for player " + id);
        }
        try {
            Path path = fileStorageService.resolve(player.getPhotoPath());
            byte[] bytes = Files.readAllBytes(path);
            return new PhotoData(bytes, contentTypeOf(player.getPhotoPath()));
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not read photo");
        }
    }

    public Player getEntity(Long id) {
        return playerRepository.findById(id).orElseThrow(() -> NotFoundException.of("Player", id));
    }

    // --- helpers ---

    private void applyRegistration(Player player, PlayerRegistrationRequest req) {
        player.setFirstName(req.firstName());
        player.setMiddleName(req.middleName());
        player.setLastName(req.lastName());
        player.setPhone(req.phone().trim());
        player.setEmail(req.email().trim());
        player.setAddress(toAddress(req.address()));
        player.setPreferredPositions(new HashSet<>(req.preferredPositions()));
        player.setTshirtSize(req.tshirtSize());
        player.setEmergencyContactName(req.emergencyContactName());
        player.setEmergencyContactPhone(req.emergencyContactPhone());
        player.setSkillLevel(req.skillLevel());
        player.setYearsExperience(req.yearsExperience());
        player.setJerseyNumberPreference(req.jerseyNumberPreference());
        player.setWaiverAccepted(req.waiverAccepted());
        player.setPhotoConsent(req.photoConsent());
        player.setDietaryNotes(req.dietaryNotes());
        player.setGender(req.gender());
        player.setDateOfBirth(req.dateOfBirth());
        player.setNotes(req.notes());
        player.setPaymentStatus(PaymentStatus.UNPAID);
        player.setManualEntry(false);
    }

    private Address toAddress(AddressDto dto) {
        Address address = new Address();
        if (dto != null) {
            address.setLine1(dto.line1());
            address.setLine2(dto.line2());
            address.setCity(dto.city());
            address.setProvince(dto.province());
            address.setPostalCode(dto.postalCode());
            address.setCountry(dto.countryOrDefault());
        }
        return address;
    }

    private PlayerResponse toResponse(Player player) {
        boolean hasAccount = userAccountRepository.existsByPlayerId(player.getId());
        return playerMapper.toResponse(player, hasAccount);
    }

    private void assertCanView(Player player) {
        AuthenticatedUser user = SecurityUtils.currentUser();
        if (!user.isAdmin() && !player.getId().equals(user.playerId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You may only view your own registration");
        }
    }

    private static String contentTypeOf(String key) {
        String lower = key.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".webp")) return "image/webp";
        return "image/jpeg";
    }
}
