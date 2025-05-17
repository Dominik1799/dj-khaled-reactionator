package org.acme.service;

import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.rag.query.Query;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.panache.common.Sort;
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
import java.util.stream.Collectors;

@ApplicationScoped
public class GifService {

    private static final String DOCUMENT_METADATA_DB_ID_KEY = "database_id";
    private static final String DOCUMENT_METADATA_FULL_DOCUMENT_TEXT_KEY = "document_text";

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
            query = GifMetadata.find("descriptions is empty", Sort.descending("updated"));
        } else {
            query = GifMetadata.findAll(Sort.descending("updated"));
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

    // NOTE: this can be more effective, this basically expects an array of descriptions that can come in.
    // It does not check if there is already said description for a particular gif, so it deletes all descriptions
    // and re-indexes everything... A check for this could be good but for now, send it
    @Transactional
    public void addMetadataToGif(UUID gifId, String name, String[] descriptions) {
        GifMetadata metadata = GifMetadata.findById(gifId);
        if (metadata == null) {
            throw new RuntimeException("Gif not found");
        }
        metadata.name = name;
        if (descriptions != null && descriptions.length > 0) {
            metadata.descriptions = new HashSet<>(List.of(descriptions));
        }
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
        metadata.descriptions.forEach(d -> {
            var document = Document.from(d, Metadata.from(metadataMap));
            ingestor.ingest(document);
        });
    }

    private void deleteDocumentInChromaByDatabaseId(String documentDatabaseId, String description) {
        var collectionId = getChromaCollectionId();
        // the collection was not created yet
        if (collectionId == null)
            return;
        Map<String, String> metadataFilter = Map.of(DOCUMENT_METADATA_DB_ID_KEY, documentDatabaseId);
        Map<String, String> documentTextSearch = Map.of("$contains", description);
        var filter = Map.of("where", metadataFilter, "where_document", documentTextSearch);
        chromaRestClient.deleteDocumentsByWhereFilter(collectionId, filter);
    }

    private void deleteDocumentInChromaByDatabaseId(String documentDatabaseId) {
        var collectionId = getChromaCollectionId();
        // the collection was not created yet
        if (collectionId == null)
            return;
        Map<String, String> metadataFilter = Map.of(DOCUMENT_METADATA_DB_ID_KEY, documentDatabaseId);
        var filter = Map.of("where", metadataFilter);
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
                .distinct()
                .toList();
    }

    @Transactional
    public Response deleteGif(UUID id, String description) {
        GifMetadata gifMetadata = GifMetadata.findById(id);
        if (gifMetadata == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("GIF not found").build();
        }
        if (description == null) {
            // delete all gif data
            deleteDocumentInChromaByDatabaseId(id.toString());
            gifMetadata.delete();
            Path destination = Path.of(uploadDir, gifMetadata.mediaDirectoryFileName);
            File file = destination.toFile();
            file.delete();
        } else {
            // delete only one description
            deleteDocumentInChromaByDatabaseId(id.toString(), description);
            gifMetadata.descriptions = gifMetadata.descriptions.stream().filter(d -> !d.equals(description)).collect(Collectors.toSet());
            gifMetadata.persist();
        }

        return Response.ok().build();
    }
}
