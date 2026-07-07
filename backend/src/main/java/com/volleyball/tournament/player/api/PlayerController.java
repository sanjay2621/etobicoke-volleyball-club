package com.volleyball.tournament.player.api;

import com.volleyball.tournament.player.entity.PaymentStatus;
import com.volleyball.tournament.player.model.CopyPlayerRequest;
import com.volleyball.tournament.player.model.PlayerLookupResponse;
import com.volleyball.tournament.player.model.PlayerRegistrationRequest;
import com.volleyball.tournament.player.model.PlayerResponse;
import com.volleyball.tournament.player.model.PlayerUpdateRequest;
import com.volleyball.tournament.player.service.PlayerService;
import com.volleyball.tournament.player.service.PlayerService.PhotoData;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    /** Public registration. multipart/form-data: JSON "data" part + optional "photo" file part. */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public PlayerResponse register(
            @Valid @RequestPart("data") PlayerRegistrationRequest data,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {
        return playerService.register(data, photo);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<PlayerResponse> list(@RequestParam Long tournamentId) {
        return playerService.listByTournament(tournamentId);
    }

    /** Public lookup for the registration page's "already registered previously?" prefill. */
    @GetMapping("/lookup")
    public PlayerLookupResponse lookup(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone) {
        return playerService.lookupPrevious(email, phone);
    }

    /** Admin copies a player's info into another tournament without the player re-registering. */
    @PostMapping("/{id}/copy")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public PlayerResponse copy(@PathVariable Long id, @Valid @RequestBody CopyPlayerRequest req) {
        return playerService.copyToTournament(id, req.targetTournamentId());
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> exportCsv(@RequestParam Long tournamentId) {
        return csv(playerService.exportCsv(tournamentId), "players-" + tournamentId + ".csv");
    }

    static ResponseEntity<String> csv(String body, String filename) {
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(body);
    }

    /** Admin creates a player who never registered publicly (e.g. a late add for a team). */
    @PostMapping("/manual")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public PlayerResponse createManual(
            @Valid @RequestBody com.volleyball.tournament.player.model.ManualPlayerRequest req) {
        return playerService.createManual(req);
    }

    /** Current player's own registration. */
    @GetMapping("/me")
    public PlayerResponse me() {
        return playerService.getCurrent();
    }

    /** Admin, or the owning player. */
    @GetMapping("/{id}")
    public PlayerResponse get(@PathVariable Long id) {
        return playerService.getById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public PlayerResponse update(@PathVariable Long id, @Valid @RequestBody PlayerUpdateRequest req) {
        return playerService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        playerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** Captain marks a player on their own team as PAID or UNPAID. */
    @PatchMapping("/{id}/payment")
    public PlayerResponse markPayment(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        PaymentStatus status = PaymentStatus.valueOf(body.get("paymentStatus"));
        return playerService.captainMarkPayment(id, status);
    }

    /** Player uploads or replaces their own photo. */
    @PostMapping(value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PlayerResponse uploadMyPhoto(@RequestPart("photo") MultipartFile photo) {
        return playerService.uploadMyPhoto(photo);
    }

    /** Admin uploads or replaces a player's photo. */
    @PostMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public PlayerResponse uploadPhoto(
            @PathVariable Long id,
            @RequestPart("photo") MultipartFile photo) {
        return playerService.uploadPhoto(id, photo);
    }

    /** Public photo endpoint (referenced by PlayerResponse.photoUrl). */
    @GetMapping("/{id}/photo")
    public ResponseEntity<byte[]> photo(@PathVariable Long id) {
        PhotoData data = playerService.getPhoto(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(data.contentType()))
                .cacheControl(CacheControl.maxAge(java.time.Duration.ofHours(1)))
                .body(data.bytes());
    }
}
