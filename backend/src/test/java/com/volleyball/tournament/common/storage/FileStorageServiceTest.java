package com.volleyball.tournament.common.storage;

import static org.assertj.core.api.Assertions.assertThat;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

class FileStorageServiceTest {

    private final FileStorageService service = new FileStorageService(10 * 1024 * 1024);

    private static byte[] pngOf(int width, int height) throws Exception {
        BufferedImage img = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        var g = img.createGraphics();
        g.setColor(Color.RED);
        g.fillRect(0, 0, width, height);
        g.dispose();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(img, "png", out);
        return out.toByteArray();
    }

    @Test
    void readPhoto_downscalesOversizedImageAndReencodesAsJpeg() throws Exception {
        byte[] original = pngOf(2000, 1000);
        MockMultipartFile file = new MockMultipartFile("photo", "big.png", "image/png", original);

        FileStorageService.StoredPhoto stored = service.readPhoto(file);

        assertThat(stored.contentType()).isEqualTo("image/jpeg");
        BufferedImage decoded = ImageIO.read(new ByteArrayInputStream(stored.bytes()));
        assertThat(decoded.getWidth()).isEqualTo(500);
        assertThat(decoded.getHeight()).isEqualTo(250);
        assertThat(stored.bytes().length).isLessThan(original.length);
    }

    @Test
    void readPhoto_leavesAlreadySmallImageDimensionsUnchanged() throws Exception {
        byte[] original = pngOf(120, 80);
        MockMultipartFile file = new MockMultipartFile("photo", "small.png", "image/png", original);

        FileStorageService.StoredPhoto stored = service.readPhoto(file);

        BufferedImage decoded = ImageIO.read(new ByteArrayInputStream(stored.bytes()));
        assertThat(decoded.getWidth()).isEqualTo(120);
        assertThat(decoded.getHeight()).isEqualTo(80);
    }

    @Test
    void readPhoto_rejectsUnsupportedContentType() {
        MockMultipartFile file = new MockMultipartFile("photo", "doc.pdf", "application/pdf", new byte[]{1, 2, 3});

        org.junit.jupiter.api.Assertions.assertThrows(
                com.volleyball.tournament.common.exception.ApiException.class,
                () -> service.readPhoto(file));
    }

    @Test
    void resizeToJpeg_isIdempotentOnAlreadyResizedBytes() throws Exception {
        byte[] original = pngOf(2000, 1000);
        MockMultipartFile file = new MockMultipartFile("photo", "big.png", "image/png", original);
        byte[] onceResized = service.readPhoto(file).bytes();

        byte[] twiceResized = service.resizeToJpeg(onceResized);

        BufferedImage decoded = ImageIO.read(new ByteArrayInputStream(twiceResized));
        assertThat(decoded.getWidth()).isEqualTo(500);
        assertThat(decoded.getHeight()).isEqualTo(250);
    }
}
