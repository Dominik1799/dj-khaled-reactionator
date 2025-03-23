package org.acme.controller;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.entities.GifUploadEntity;
import org.acme.service.GifService;
import org.jboss.resteasy.reactive.MultipartForm;

import java.util.Map;
import java.util.UUID;

@Path("/")
public class GifController {

    @Inject
    GifService gifService;

    @POST
    @Path("/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Response uploadOneOrMoreGif(@MultipartForm GifUploadEntity gifUploadEntity) {
        var isOk = gifService.storeGifs(gifUploadEntity);
        if (isOk)
            return Response.ok(Map.of("created_gifs", gifUploadEntity.gifs.size())).build();
        return Response.serverError().build();
    }

    @PUT
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateGifMetadata(@PathParam("id") UUID id,
                                      @QueryParam("name") String name,
                                      @QueryParam("description") String description){
        gifService.addMetadataToGif(id, name, description);
        return Response.ok().build();
    }
}
