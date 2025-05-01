package org.acme.controller;

import io.smallrye.common.constraint.NotNull;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.entities.GifResponseEntity;
import org.acme.entities.GifUploadEntity;
import org.acme.persistence.GifMetadata;
import org.acme.service.GifService;
import org.jboss.resteasy.reactive.MultipartForm;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Path("/")
public class GifController {

    @Inject
    GifService gifService;

    @GET
    @Path("/gif")
    @Produces(MediaType.APPLICATION_JSON)
    public GifResponseEntity getGifs(@QueryParam("page") @NotNull Integer page,
                                     @QueryParam("pageSize") @NotNull Integer pageSize,
                                     @QueryParam("onlyNullDescription") @NotNull Boolean onlyNullDescription) {
        return gifService.getGifs(page, pageSize, onlyNullDescription);

    }

    @GET
    @Path("/search")
    @Produces(MediaType.APPLICATION_JSON)
    public List<String> searchGifs(@QueryParam("query") String query) {
        return gifService.searchGifs(query);
    }

    @GET
    @Path("/gif/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public GifMetadata getSingleGif(@QueryParam("id") @NotNull UUID id) {
        return GifMetadata.findById(id);

    }

    @GET
    @Path("/gif/media/{id}")
    @Produces("image/gif")
    public Response getGifMedia(@PathParam("id") @NotNull UUID id) throws IOException {
        return gifService.getGifMedia(id);

    }

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
    @Path("/gif/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateGifMetadata(@PathParam("id") UUID id,
                                      @QueryParam("name") String name,
                                      @QueryParam("description") String[] description){
        gifService.addMetadataToGif(id, name, description);
        return Response.ok().build();
    }

    @DELETE
    @Path("/gif/{id}")
    public Response deleteGif(@PathParam("id") UUID id, @QueryParam("description") String description) {
        return gifService.deleteGif(id, description);
    }
}
