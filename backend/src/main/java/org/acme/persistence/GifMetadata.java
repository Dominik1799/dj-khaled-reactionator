package org.acme.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.*;

@Entity
@Table(name = "gif_metadata")
public class GifMetadata extends PanacheEntityBase {
    @Id
    @GeneratedValue
    public UUID id;
    protected OffsetDateTime created;
    protected OffsetDateTime updated;
    public String name;
    @ElementCollection
    @CollectionTable(
            name = "gif_descriptions",
            joinColumns = @JoinColumn(name = "gif_id")
    )
    @Column(name = "description")
    public Set<String> descriptions = new HashSet<>();
    @Column(name = "media_directory_file_name")
    public String mediaDirectoryFileName;

    @PrePersist
    protected void setTimestampsPersist() {
        this.created = OffsetDateTime.now();
        this.updated = OffsetDateTime.now();
    }

    @PreUpdate
    protected void setTimestampsUpdate() {
        this.updated = OffsetDateTime.now();
    }
}
