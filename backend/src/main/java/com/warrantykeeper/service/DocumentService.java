package com.warrantykeeper.service;

import com.warrantykeeper.dto.DocumentResponse;
import com.warrantykeeper.entity.Document;
import com.warrantykeeper.entity.DocumentType;
import com.warrantykeeper.entity.Product;
import com.warrantykeeper.exception.BadRequestException;
import com.warrantykeeper.exception.ResourceNotFoundException;
import com.warrantykeeper.repository.DocumentRepository;
import com.warrantykeeper.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Status;
import jakarta.transaction.Synchronization;
import jakarta.transaction.TransactionSynchronizationRegistry;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.multipart.FileUpload;

@ApplicationScoped
public class DocumentService {

    private static final Logger LOG = Logger.getLogger(DocumentService.class);
    private static final Map<String, Set<String>> ALLOWED_MIME_BY_EXT = Map.of(
            "pdf", Set.of("application/pdf"),
            "jpg", Set.of("image/jpeg"),
            "jpeg", Set.of("image/jpeg"),
            "png", Set.of("image/png"));

    @ConfigProperty(name = "app.upload-dir")
    String uploadDir;

    @ConfigProperty(name = "app.max-file-size-bytes")
    long maxFileSize;

    @Inject
    DocumentRepository documents;

    @Inject
    ProductRepository products;

    @Inject
    TransactionSynchronizationRegistry txRegistry;

    private Path root;

    @PostConstruct
    void init() {
        try {
            root = Path.of(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new UncheckedIOException("Cannot create upload directory " + uploadDir, e);
        }
    }

    public List<DocumentResponse> list(Long productId) {
        requireProduct(productId);
        return documents.findByProduct(productId).stream().map(DocumentService::toResponse).toList();
    }

    @Transactional
    public DocumentResponse upload(Long productId, FileUpload file, String documentType) {
        Product product = requireProduct(productId);
        if (file == null) {
            throw new BadRequestException("No file was uploaded.");
        }
        DocumentType type = parseType(documentType);
        String originalName = cleanFileName(file.fileName());
        String ext = extension(originalName);
        String mime = ext == null ? null : resolveMime(ext, file.contentType());
        validate(file, ext, mime);

        String storedName = UUID.randomUUID() + "." + ext;
        Path target = root.resolve(storedName);
        try {
            Files.copy(file.uploadedFile(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException("Unable to store uploaded file", e);
        }

        Document doc = new Document();
        doc.product = product;
        doc.fileName = originalName;
        doc.filePath = storedName;
        doc.fileType = mime;
        doc.documentType = type;
        doc.fileSize = file.size();
        documents.persist(doc);

        // If the surrounding transaction rolls back, don't leave an orphan file behind.
        txRegistry.registerInterposedSynchronization(new Synchronization() {
            @Override
            public void beforeCompletion() {
                // nothing to do
            }

            @Override
            public void afterCompletion(int status) {
                if (status != Status.STATUS_COMMITTED) {
                    deleteQuietly(storedName);
                }
            }
        });
        return toResponse(doc);
    }

    public record StoredDocument(Document document, Path path) {
    }

    public StoredDocument getFile(Long id) {
        Document doc = find(id);
        Path path = resolve(doc.filePath);
        if (!Files.isRegularFile(path)) {
            throw new ResourceNotFoundException("The file for this document is missing.");
        }
        return new StoredDocument(doc, path);
    }

    @Transactional
    public void delete(Long id) {
        Document doc = find(id);
        String stored = doc.filePath;
        documents.delete(doc);
        deleteFilesAfterCommit(List.of(stored));
    }

    /** Deletes the given stored files once the current transaction has committed. */
    public void deleteFilesAfterCommit(List<String> storedNames) {
        if (storedNames.isEmpty()) {
            return;
        }
        txRegistry.registerInterposedSynchronization(new Synchronization() {
            @Override
            public void beforeCompletion() {
                // nothing to do
            }

            @Override
            public void afterCompletion(int status) {
                if (status == Status.STATUS_COMMITTED) {
                    storedNames.forEach(DocumentService.this::deleteQuietly);
                }
            }
        });
    }

    private void validate(FileUpload file, String ext, String mime) {
        if (ext == null || mime == null) {
            throw new BadRequestException("Only PDF, JPG, JPEG and PNG files are allowed.");
        }
        if (file.size() <= 0) {
            throw new BadRequestException("The file is empty.");
        }
        if (file.size() > maxFileSize) {
            throw new BadRequestException("File is too large. The maximum size is 10 MB.");
        }
        if (!hasExpectedSignature(file.uploadedFile(), mime)) {
            throw new BadRequestException("The file content does not match its type.");
        }
    }

    private static String resolveMime(String ext, String declared) {
        Set<String> allowed = ALLOWED_MIME_BY_EXT.get(ext);
        if (allowed == null) {
            return null;
        }
        String d = declared == null ? "" : declared.toLowerCase(Locale.ROOT).split(";")[0].trim();
        return allowed.contains(d) ? d : null;
    }

    private static boolean hasExpectedSignature(Path path, String mime) {
        try (InputStream in = Files.newInputStream(path)) {
            byte[] h = in.readNBytes(8);
            return switch (mime) {
                case "application/pdf" -> h.length >= 4 && h[0] == '%' && h[1] == 'P' && h[2] == 'D' && h[3] == 'F';
                case "image/png" -> h.length >= 4 && (h[0] & 0xFF) == 0x89 && h[1] == 'P' && h[2] == 'N' && h[3] == 'G';
                case "image/jpeg" -> h.length >= 3 && (h[0] & 0xFF) == 0xFF && (h[1] & 0xFF) == 0xD8 && (h[2] & 0xFF) == 0xFF;
                default -> false;
            };
        } catch (IOException e) {
            return false;
        }
    }

    private static DocumentType parseType(String value) {
        if (value == null || value.isBlank()) {
            return DocumentType.OTHER;
        }
        try {
            return DocumentType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid document type.");
        }
    }

    private static String cleanFileName(String name) {
        if (name == null || name.isBlank()) {
            return "document";
        }
        String n = name.replace('\\', '/');
        n = n.substring(n.lastIndexOf('/') + 1).trim();
        return n.length() > 255 ? n.substring(n.length() - 255) : n;
    }

    private static String extension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot < 0 || dot == fileName.length() - 1 ? null : fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    /** Resolves a stored name inside the upload root, refusing anything that escapes it. */
    private Path resolve(String storedName) {
        Path p = root.resolve(storedName).normalize();
        if (!p.startsWith(root)) {
            throw new ResourceNotFoundException("Document not found.");
        }
        return p;
    }

    private void deleteQuietly(String storedName) {
        try {
            Files.deleteIfExists(resolve(storedName));
        } catch (IOException | RuntimeException e) {
            LOG.warnf("Could not delete file %s: %s", storedName, e.getMessage());
        }
    }

    private Product requireProduct(Long id) {
        Product product = products.findById(id);
        if (product == null) {
            throw new ResourceNotFoundException("Product not found.");
        }
        return product;
    }

    private Document find(Long id) {
        Document doc = documents.findById(id);
        if (doc == null) {
            throw new ResourceNotFoundException("Document not found.");
        }
        return doc;
    }

    static DocumentResponse toResponse(Document d) {
        return new DocumentResponse(d.id, d.product.id, d.fileName, d.fileType, d.documentType, d.fileSize, d.createdAt);
    }
}
