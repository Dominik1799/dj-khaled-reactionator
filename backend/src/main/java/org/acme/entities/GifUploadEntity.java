package org.acme.entities;

import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.core.MediaType;
import org.jboss.resteasy.reactive.PartType;

import java.io.File;
import java.util.List;

public class GifUploadEntity {

    @PartType(MediaType.APPLICATION_OCTET_STREAM)
    @FormParam("gifs")
    public List<File> gifs;
}
