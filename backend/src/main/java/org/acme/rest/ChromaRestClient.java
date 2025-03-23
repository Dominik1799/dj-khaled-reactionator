package org.acme.rest;


import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.List;
import java.util.Map;

@RegisterRestClient(configKey = "chroma-rest-client")
public interface ChromaRestClient {
    @GET
    @Path("/api/v1/collections")
    List<Map<String, Object>> getAllCollections();

    @POST
    @Path("/api/v1/collections/{collectionId}/delete")
    List<String> deleteDocumentsByWhereFilter(@PathParam("collectionId") String collectionId, Map<String, Map<String, String>> filter);
}
