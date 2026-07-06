package com.volleyball.tournament.common.storage;

import com.volleyball.tournament.common.exception.ApiException;
import java.io.IOException;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 * Validates uploaded player photos and reads their bytes for storage in the database.
 * Render's web service filesystem is ephemeral, so photo bytes are persisted in Postgres
 * (player.photo_data) rather than on local disk.
 */
@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");
    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("jpg", "jpeg", "png", "webp");

    public record StoredPhoto(byte[] bytes, String contentType) {
    }

    private final long maxBytes;

    public FileStorageService(@Value("${app.storage.max-photo-bytes}") long maxBytes) {
        this.maxBytes = maxBytes;
    }

    /** Validates the uploaded photo and returns its bytes and content type for DB storage. */
    public StoredPhoto readPhoto(MultipartFile file) {
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
            return new StoredPhoto(file.getBytes(), contentType);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read photo");
        }
    }

    private static String extensionOf(String filename) {
        String ext = StringUtils.getFilenameExtension(filename);
        return ext == null ? "" : ext.toLowerCase();
    }
}
