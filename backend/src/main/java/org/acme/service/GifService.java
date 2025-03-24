package org.acme.service;

import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.rag.query.Query;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.entities.GifResponseEntity;
import org.acme.entities.GifUploadEntity;
import org.acme.persistence.GifMetadata;
import org.acme.rest.ChromaRestClient;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jboss.logging.Logger;

import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import io.quarkiverse.langchain4j.chroma.ChromaEmbeddingStore;
import dev.langchain4j.data.document.Document;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.*;

@ApplicationScoped
public class GifService {

    private static final String DOCUMENT_METADATA_DB_ID_KEY = "database_id";

    @Inject
    ChromaEmbeddingStore store;

    @Inject
    @RestClient
    ChromaRestClient chromaRestClient;

    @Inject
    EmbeddingModel embeddingModel;

    @ConfigProperty(name = "gif.mediaDirectoryPath")
    String uploadDir;

    @ConfigProperty(name = "quarkus.langchain4j.chroma.collection-name")
    String chromaCollectionName;

    private static final Logger LOGGER = Logger.getLogger(GifService.class);


    public GifResponseEntity getGifs(Integer page, Integer pageSize, Boolean onlyNullDescription) {
        PanacheQuery<GifMetadata> query;
        if (onlyNullDescription) {
            query = GifMetadata.find("description is null");
        } else {
            query = GifMetadata.findAll();
        }
        query.page(page, pageSize);
        var result = query.list();
        return new GifResponseEntity(result, page, pageSize, query.pageCount());

    }

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
                // persist file to disk
                var fileName = UUID.randomUUID() + ".gif";
                Path destination = Path.of(uploadDir, fileName);
                Files.copy(file.toPath(), destination, StandardCopyOption.REPLACE_EXISTING);

                // persist metadata to db
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

    @Transactional
    public void addMetadataToGif(UUID gifId, String name, String description) {
        GifMetadata metadata = GifMetadata.findById(gifId);
        if (metadata == null) {
            throw new RuntimeException("Gif not found");
        }
        metadata.name = name;
        metadata.description = description;
        metadata.persist();

        // vectorize gif metadata to chromaDB
        // first delete old document in chroma
        // the delete operation id idempotent
        deleteDocumentInChromaByDatabaseId(gifId.toString());

        EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                .embeddingStore(store)
                .embeddingModel(embeddingModel)
                .build();
        Map<String, String> metadataMap = new HashMap<>();
        metadataMap.put(DOCUMENT_METADATA_DB_ID_KEY, gifId.toString());
        var document = Document.from(description, Metadata.from(metadataMap));
        ingestor.ingest(document);
    }

    // this ensures that for each gif stored we have only one record in chromaDB
    private void deleteDocumentInChromaByDatabaseId(String documentDatabaseId) {
        var collectionId = getChromaCollectionId();
        // the collection was not created yet
        if (collectionId == null)
            return;
        Map<String, String> innerFilter = Map.of(DOCUMENT_METADATA_DB_ID_KEY, documentDatabaseId);
        var filter = Map.of("where", innerFilter);
        chromaRestClient.deleteDocumentsByWhereFilter(collectionId, filter);
    }

    private String getChromaCollectionId() {
        var collections = chromaRestClient.getAllCollections();
        for (var collection : collections) {
            var collectionName = (String) collection.get("name");
            var collectionId = (String) collection.get("id");
            if (Objects.equals(collectionName, chromaCollectionName)) {
                return collectionId;
            }
        }
        return null;
    }

    public Response getGifMedia(UUID gifId) throws IOException {
        GifMetadata gifMetadata = GifMetadata.findById(gifId);
        Path destination = Path.of(uploadDir, gifMetadata.mediaDirectoryFileName);
        File file = destination.toFile();
        if (!file.exists()) {
            return Response.status(Response.Status.NOT_FOUND).entity("GIF not found").build();
        }
        byte[] gifData = Files.readAllBytes(destination);
        return Response.ok(gifData).type(MediaType.valueOf("image/gif")).build();
    }

    public List<String> searchGifs(String query) {
        EmbeddingStoreContentRetriever retriever = EmbeddingStoreContentRetriever.builder()
                .embeddingStore(store)
                .embeddingModel(embeddingModel)
                .maxResults(5)
                .build();
        var searchResult = retriever.retrieve(Query.from(query));
        return searchResult.stream()
                .map(sr -> sr.textSegment().metadata().getString(DOCUMENT_METADATA_DB_ID_KEY))
                .toList();
    }
}
