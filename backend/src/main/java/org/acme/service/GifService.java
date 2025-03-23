package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.acme.entities.GifUploadEntity;
import org.acme.persistence.GifMetadata;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@ApplicationScoped
public class GifService {

    @ConfigProperty(name = "gif.mediaDirectoryPath")
    String uploadDir;

    private static final Logger LOGGER = Logger.getLogger(GifService.class);

    // return true if success, false if something failed
    @Transactional
    public boolean storeGifs(GifUploadEntity gifUploadEntity) {
        try {
            // Ensure upload directory exists
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            for (File file : gifUploadEntity.gifs) {
                var fileName = UUID.randomUUID() + ".gif";
                Path destination = Path.of(uploadDir, fileName);
                Files.copy(file.toPath(), destination, StandardCopyOption.REPLACE_EXISTING);

                GifMetadata metadata = new GifMetadata();
                metadata.mediaDirectoryFileName = fileName;
                metadata.persist();
            }
            return true;
        } catch (IOException e) {
            LOGGER.error("Error occured while uploading gifs", e);
            return false;
        }
    }
}
