package org.acme.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "gif_metadata")
public class GifMetadata extends PanacheEntityBase {
    @Id
    @GeneratedValue
    public UUID id;
    protected OffsetDateTime created;
    protected OffsetDateTime updated;
    public String name;
    public String description;
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
