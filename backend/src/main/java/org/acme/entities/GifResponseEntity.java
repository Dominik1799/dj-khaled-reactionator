package org.acme.entities;

import org.acme.persistence.GifMetadata;

import java.util.List;

public class GifResponseEntity {
    public GifResponseEntity(List<GifMetadata> gifs, int page, int pageSize, int totalPages) {
        this.gifs = gifs;
        this.page = page;
        this.pageSize = pageSize;
        this.totalPages = totalPages;
    }

    public List<GifMetadata> gifs;

    public int page;
    public int pageSize;
    public int totalPages;
}
