package com.warrantykeeper.repository;

import com.warrantykeeper.entity.Document;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class DocumentRepository implements PanacheRepository<Document> {

    public List<Document> findByProduct(Long productId) {
        return list("product.id", Sort.by("createdAt").descending(), productId);
    }
}
