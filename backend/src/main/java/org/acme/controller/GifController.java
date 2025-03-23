package org.acme.controller;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.entities.GifUploadEntity;
import org.acme.service.GifService;
import org.jboss.resteasy.reactive.MultipartForm;

import java.util.Map;

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
}
