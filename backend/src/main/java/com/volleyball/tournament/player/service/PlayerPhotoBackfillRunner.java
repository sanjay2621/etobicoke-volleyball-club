package com.volleyball.tournament.player.service;

import com.volleyball.tournament.common.storage.FileStorageService;
import com.volleyball.tournament.player.entity.Player;
import com.volleyball.tournament.player.repository.PlayerRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * One-time-per-boot cleanup: re-encodes any player photo stored before server-side resizing was
 * added (readPhoto now downscales on upload). Threshold-gated and idempotent — once a photo has
 * been resized it lands well under the threshold, so later boots find nothing to do.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PlayerPhotoBackfillRunner implements ApplicationRunner {

    /** Resized photos land well under this; anything above it predates the resize. */
    private static final long BACKFILL_THRESHOLD_BYTES = 200_000;

    private final PlayerRepository playerRepository;
    private final FileStorageService fileStorageService;

    @Override
    public void run(ApplicationArguments args) {
        List<Long> ids = playerRepository.findIdsWithPhotoLargerThan(BACKFILL_THRESHOLD_BYTES);
        if (ids.isEmpty()) {
            return;
        }
        log.info("Resizing {} oversized player photo(s) uploaded before compression was added", ids.size());
        int resized = 0;
        for (Long id : ids) {
            try {
                resizeOne(id);
                resized++;
            } catch (Throwable e) {
                // Catch Throwable, not just Exception: a single oversized legacy photo can throw
                // OutOfMemoryError during decode, which is an Error — left uncaught, that crashes
                // the whole application boot instead of just skipping one photo.
                log.warn("Failed to resize photo for player {}: {}", id, e.getMessage());
            }
        }
        log.info("Player photo backfill complete: {}/{} resized", resized, ids.size());
    }

    @Transactional
    void resizeOne(Long id) throws Exception {
        Player player = playerRepository.findById(id).orElse(null);
        if (player == null || player.getPhotoData() == null) {
            return;
        }
        byte[] resized = fileStorageService.resizeToJpeg(player.getPhotoData());
        player.setPhotoData(resized);
        player.setPhotoContentType(FileStorageService.OUTPUT_CONTENT_TYPE);
    }
}
