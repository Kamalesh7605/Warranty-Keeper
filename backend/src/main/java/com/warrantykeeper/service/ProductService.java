package com.warrantykeeper.service;

import com.warrantykeeper.dto.ProductFilter;
import com.warrantykeeper.dto.ProductRequest;
import com.warrantykeeper.dto.ProductResponse;
import com.warrantykeeper.entity.Document;
import com.warrantykeeper.entity.Product;
import com.warrantykeeper.entity.WarrantyStatus;
import com.warrantykeeper.exception.BadRequestException;
import com.warrantykeeper.exception.ResourceNotFoundException;
import com.warrantykeeper.repository.DocumentRepository;
import com.warrantykeeper.repository.ProductRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class ProductService {

    @Inject
    ProductRepository products;

    @Inject
    DocumentRepository documents;

    @Inject
    CategoryService categoryService;

    @Inject
    DocumentService documentService;

    @Inject
    WarrantyService warranty;

    public List<ProductResponse> list(ProductFilter f) {
        LocalDate today = LocalDate.now();
        return products.search(f.search(), f.categoryId()).stream()
                .map(p -> toResponse(p, today))
                .filter(r -> f.status() == null || matchesStatusFilter(r.warrantyStatus(), f.status()))
                .filter(r -> inRange(r.purchaseDate(), f.purchaseFrom(), f.purchaseTo()))
                .filter(r -> inRange(r.warrantyExpiryDate(), f.expiryFrom(), f.expiryTo()))
                .toList();
    }

    /** A product without a date never matches a date restriction. */
    private static boolean inRange(LocalDate value, LocalDate from, LocalDate to) {
        if (from == null && to == null) {
            return true;
        }
        return value != null && (from == null || !value.isBefore(from)) && (to == null || !value.isAfter(to));
    }

    public ProductResponse get(Long id) {
        return toResponse(find(id), LocalDate.now());
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = new Product();
        apply(product, request);
        products.persist(product);
        return toResponse(product, LocalDate.now());
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = find(id);
        apply(product, request);
        return toResponse(product, LocalDate.now());
    }

    /** Removes the product and its document rows; files are deleted only once the transaction commits. */
    @Transactional
    public void delete(Long id) {
        Product product = find(id);
        List<Document> docs = documents.findByProduct(id);
        List<String> files = docs.stream().map(d -> d.filePath).toList();
        docs.forEach(documents::delete);
        products.delete(product);
        documentService.deleteFilesAfterCommit(files);
    }

    public List<ProductResponse> expiringSoon() {
        LocalDate today = LocalDate.now();
        return products.findExpiringBetween(today, today.plusDays(warranty.getExpiringSoonDays())).stream()
                .map(p -> toResponse(p, today))
                .toList();
    }

    Product find(Long id) {
        Product product = products.findById(id);
        if (product == null) {
            throw new ResourceNotFoundException("Product not found.");
        }
        return product;
    }

    ProductResponse toResponse(Product p, LocalDate today) {
        return new ProductResponse(
                p.id, p.name, p.brand, p.modelNumber, p.serialNumber, p.barcode,
                p.category.id, p.category.name,
                p.purchaseDate, p.purchasePrice, p.warrantyStartDate, p.warrantyExpiryDate,
                p.warrantyPeriod, p.warrantyPeriodUnit, p.storeSeller, p.notes,
                warranty.statusFor(p.warrantyExpiryDate, today),
                warranty.daysUntilExpiry(p.warrantyExpiryDate, today),
                p.createdAt, p.updatedAt);
    }

    private void apply(Product product, ProductRequest r) {
        if (r.warrantyPeriod() != null && r.warrantyPeriodUnit() == null) {
            throw new BadRequestException("Warranty unit is required when a period is given.",
                    Map.of("warrantyPeriodUnit", "Warranty unit is required"));
        }
        LocalDate expiry = r.warrantyExpiryDate() != null
                ? r.warrantyExpiryDate()
                : warranty.calculateExpiry(r.purchaseDate(), r.warrantyPeriod(), r.warrantyPeriodUnit());
        if (expiry != null && expiry.isBefore(r.purchaseDate())) {
            throw new BadRequestException("Warranty expiry cannot be before the purchase date.",
                    Map.of("warrantyExpiryDate", "Expiry date must be on or after the purchase date"));
        }

        product.name = r.name().trim();
        product.brand = blankToNull(r.brand());
        product.modelNumber = blankToNull(r.modelNumber());
        product.serialNumber = blankToNull(r.serialNumber());
        product.barcode = blankToNull(r.barcode());
        product.category = categoryService.find(r.categoryId());
        product.purchaseDate = r.purchaseDate();
        product.purchasePrice = r.purchasePrice();
        product.warrantyPeriod = r.warrantyPeriod();
        product.warrantyPeriodUnit = r.warrantyPeriod() == null ? null : r.warrantyPeriodUnit();
        product.warrantyExpiryDate = expiry;
        product.warrantyStartDate = expiry == null ? null : r.purchaseDate();
        product.storeSeller = blankToNull(r.storeSeller());
        product.notes = blankToNull(r.notes());
    }

    /** "Expiring soon" in the UI filter also includes products that expire today. */
    private static boolean matchesStatusFilter(WarrantyStatus actual, WarrantyStatus wanted) {
        if (wanted == WarrantyStatus.EXPIRING_SOON) {
            return actual == WarrantyStatus.EXPIRING_SOON || actual == WarrantyStatus.EXPIRES_TODAY;
        }
        return actual == wanted;
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
