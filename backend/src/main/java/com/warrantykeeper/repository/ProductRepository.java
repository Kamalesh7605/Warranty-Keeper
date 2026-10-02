package com.warrantykeeper.repository;

import com.warrantykeeper.entity.Product;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class ProductRepository implements PanacheRepository<Product> {

    /** Text search over name/brand/model/serial/barcode, optionally restricted to one category. */
    public List<Product> search(String text, Long categoryId) {
        List<String> clauses = new ArrayList<>();
        Map<String, Object> params = new HashMap<>();
        if (text != null && !text.isBlank()) {
            clauses.add("(lower(name) like :q or lower(brand) like :q or lower(modelNumber) like :q "
                    + "or lower(serialNumber) like :q or lower(barcode) like :q)");
            params.put("q", "%" + text.trim().toLowerCase() + "%");
        }
        if (categoryId != null) {
            clauses.add("category.id = :categoryId");
            params.put("categoryId", categoryId);
        }
        Sort sort = Sort.by("createdAt").descending();
        if (clauses.isEmpty()) {
            return listAll(sort);
        }
        return list(String.join(" and ", clauses), sort, params);
    }

    public List<Product> findExpiringBetween(LocalDate from, LocalDate to) {
        return list("warrantyExpiryDate >= ?1 and warrantyExpiryDate <= ?2", Sort.by("warrantyExpiryDate"), from, to);
    }

    public List<Product> findByExpiryDate(LocalDate date) {
        return list("warrantyExpiryDate", date);
    }

    public List<Product> findByBarcode(String barcode) {
        return list("barcode = ?1 order by createdAt desc", barcode);
    }

    public long countByCategory(Long categoryId) {
        return count("category.id", categoryId);
    }
}
