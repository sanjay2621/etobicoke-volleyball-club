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
 *
 * <p>Processes at most {@link #MAX_PER_BOOT} photos per run, with a short pause between each, to
 * keep peak memory low on small containers — observed to intermittently trigger an OS-level
 * cgroup OOM-kill (not a catchable {@link OutOfMemoryError}) when churning through dozens of
 * multi-megabyte decodes back-to-back on a memory-constrained host. Remaining photos are picked up
 * on the next boot since the threshold gate makes this safely resumable.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PlayerPhotoBackfillRunner implements ApplicationRunner {

    /** Resized photos land well under this; anything above it predates the resize. */
    private static final long BACKFILL_THRESHOLD_BYTES = 200_000;

    /** Caps peak memory per boot; remaining photos are picked up on the next boot. */
    private static final int MAX_PER_BOOT = 10;

    /** Lets GC reclaim decode buffers between photos instead of piling up back-to-back. */
    private static final long PAUSE_BETWEEN_MILLIS = 300;

    private final PlayerRepository playerRepository;
    private final FileStorageService fileStorageService;

    @Override
    public void run(ApplicationArguments args) {
        List<Long> ids = playerRepository.findIdsWithPhotoLargerThan(BACKFILL_THRESHOLD_BYTES);
        if (ids.isEmpty()) {
            return;
        }
        List<Long> batch = ids.size() > MAX_PER_BOOT ? ids.subList(0, MAX_PER_BOOT) : ids;
        log.info("Resizing {} of {} oversized player photo(s) uploaded before compression was added",
                batch.size(), ids.size());
        int resized = 0;
        for (Long id : batch) {
            try {
                resizeOne(id);
                resized++;
            } catch (Throwable e) {
                // Catch Throwable, not just Exception: a single oversized legacy photo can throw
                // OutOfMemoryError during decode, which is an Error — left uncaught, that crashes
                // the whole application boot instead of just skipping one photo.
                log.warn("Failed to resize photo for player {}: {}", id, e.getMessage());
            }
            try {
                Thread.sleep(PAUSE_BETWEEN_MILLIS);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        log.info("Player photo backfill batch complete: {}/{} resized ({} remaining)",
                resized, batch.size(), ids.size() - batch.size());
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
