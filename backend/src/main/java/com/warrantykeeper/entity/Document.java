package com.warrantykeeper.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    public Product product;

    @Column(name = "file_name", nullable = false)
    public String fileName;

    /** Stored file name, relative to the upload directory. */
    @Column(name = "file_path", nullable = false)
    public String filePath;

    /** MIME type. */
    @Column(name = "file_type", nullable = false, length = 100)
    public String fileType;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 20)
    public DocumentType documentType;

    @Column(name = "file_size", nullable = false)
    public long fileSize;

    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
