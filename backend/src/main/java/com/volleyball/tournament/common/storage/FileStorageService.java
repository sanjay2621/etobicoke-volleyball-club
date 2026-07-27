package com.volleyball.tournament.common.storage;

import com.volleyball.tournament.common.exception.ApiException;
import java.awt.Color;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;
import java.util.Set;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReadParam;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.MemoryCacheImageOutputStream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 * Validates uploaded player photos and reads their bytes for storage in the database.
 * Render's web service filesystem is ephemeral, so photo bytes are persisted in Postgres
 * (player.photo_data) rather than on local disk. Photos are downscaled and re-encoded as
 * JPEG on the way in — avatars are rendered at a few dozen pixels, so storing (and later
 * re-serving) multi-megabyte camera originals wastes bandwidth and DB space for no visual
 * benefit.
 */
@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");
    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("jpg", "jpeg", "png", "webp");

    private static final int MAX_DIMENSION = 500;
    private static final float JPEG_QUALITY = 0.82f;
    public static final String OUTPUT_CONTENT_TYPE = "image/jpeg";

    public record StoredPhoto(byte[] bytes, String contentType) {
    }

    private final long maxBytes;

    public FileStorageService(@Value("${app.storage.max-photo-bytes}") long maxBytes) {
        this.maxBytes = maxBytes;
    }

    /** Validates the uploaded photo and returns its resized, re-encoded bytes for DB storage. */
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
            return new StoredPhoto(resizeToJpeg(file.getBytes()), OUTPUT_CONTENT_TYPE);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read photo");
        }
    }

    /**
     * Re-encodes already-stored photo bytes at the current target size — used to backfill legacy
     * rows. Decodes via {@link ImageReader} with source subsampling so oversized camera originals
     * (multi-thousand-pixel JPEGs) are never fully decoded at native resolution — a full-res decode
     * of a large-enough original can exceed the heap on memory-constrained hosts.
     */
    public byte[] resizeToJpeg(byte[] original) throws IOException {
        BufferedImage source;
        try (ImageInputStream iis = ImageIO.createImageInputStream(new ByteArrayInputStream(original))) {
            if (iis == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Unreadable image data");
            }
            Iterator<ImageReader> readers = ImageIO.getImageReaders(iis);
            if (!readers.hasNext()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Unreadable image data");
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(iis, true, true);
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                int subsample = Math.max(1, Math.min(width, height) == 0 ? 1
                        : (int) Math.floor(Math.max(width, height) / (double) MAX_DIMENSION));
                ImageReadParam param = reader.getDefaultReadParam();
                if (subsample > 1) {
                    param.setSourceSubsampling(subsample, subsample, 0, 0);
                }
                source = reader.read(0, param);
            } finally {
                reader.dispose();
            }
        }
        if (source == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unreadable image data");
        }

        int width = source.getWidth();
        int height = source.getHeight();
        double scale = Math.min(1.0, MAX_DIMENSION / (double) Math.max(width, height));
        int targetWidth = Math.max(1, (int) Math.round(width * scale));
        int targetHeight = Math.max(1, (int) Math.round(height * scale));

        BufferedImage scaled = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
        var g = scaled.createGraphics();
        try {
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, targetWidth, targetHeight);
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.drawImage(source, 0, 0, targetWidth, targetHeight, null);
        } finally {
            g.dispose();
        }

        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
        if (!writers.hasNext()) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "No JPEG writer available");
        }
        ImageWriter writer = writers.next();
        ImageWriteParam params = writer.getDefaultWriteParam();
        params.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        params.setCompressionQuality(JPEG_QUALITY);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (var ios = new MemoryCacheImageOutputStream(out)) {
            writer.setOutput(ios);
            writer.write(null, new IIOImage(scaled, null, null), params);
        } finally {
            writer.dispose();
        }
        return out.toByteArray();
    }

    private static String extensionOf(String filename) {
        String ext = StringUtils.getFilenameExtension(filename);
        return ext == null ? "" : ext.toLowerCase();
    }
}
