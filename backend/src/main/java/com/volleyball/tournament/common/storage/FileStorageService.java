package com.volleyball.tournament.common.storage;

import com.volleyball.tournament.common.exception.ApiException;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 * Stores uploaded player photos on the local filesystem under {uploadDir}/{tournamentId}/{uuid.ext}
 * and returns a relative storage key. Validates content type and size to avoid arbitrary uploads.
 */
@Slf4j
@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");
    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("jpg", "jpeg", "png", "webp");

    private final Path root;
    private final long maxBytes;

    public FileStorageService(
            @Value("${app.storage.upload-dir}") String uploadDir,
            @Value("${app.storage.max-photo-bytes}") long maxBytes) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.maxBytes = maxBytes;
    }

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(root);
            log.info("Photo upload directory: {}", root);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create upload directory: " + root, e);
        }
    }

    /** Stores the photo and returns its storage key (relative path), e.g. "12/ab12cd.png". */
    public String storePhoto(MultipartFile file, Long tournamentId) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Photo file is required");
        }
        if (file.getSize() > maxBytes) {
            long maxMb = Math.max(1, Math.round(maxBytes / (1024.0 * 1024.0)));
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE,
                    "The photo is too large. Please choose an image under " + maxMb + " MB.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported photo type: " + contentType);
        }
        String ext = extensionOf(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported photo extension: " + ext);
        }

        try {
            Path dir = root.resolve(String.valueOf(tournamentId)).normalize();
            if (!dir.startsWith(root)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid storage path");
            }
            Files.createDirectories(dir);
            String key = tournamentId + "/" + UUID.randomUUID() + "." + ext;
            Path target = root.resolve(key).normalize();
            Files.copy(file.getInputStream(), target);
            return key;
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store photo");
        }
    }

    /** Resolves a previously-returned storage key back to an absolute path, guarding against traversal. */
    public Path resolve(String storageKey) {
        Path p = root.resolve(storageKey).normalize();
        if (!p.startsWith(root)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid storage key");
        }
        return p;
    }

    private static String extensionOf(String filename) {
        String ext = StringUtils.getFilenameExtension(filename);
        return ext == null ? "" : ext.toLowerCase();
    }
}