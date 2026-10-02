package com.warrantykeeper.service;

import com.warrantykeeper.dto.ProductLookupResponse;
import com.warrantykeeper.entity.Product;
import com.warrantykeeper.repository.ProductRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;

/** Looks the code up among products already saved with the same barcode. */
@ApplicationScoped
public class LocalProductLookupService {

    @Inject
    ProductRepository products;

    public ProductLookupResponse lookup(String barcode) {
        if (barcode == null || barcode.isBlank()) {
            return ProductLookupResponse.notFound(barcode);
        }
        String code = barcode.trim();
        List<Product> matches = products.findByBarcode(code);
        if (matches.isEmpty()) {
            return ProductLookupResponse.notFound(code);
        }
        Product p = matches.get(0);
        return new ProductLookupResponse(code, true, p.name, p.brand, p.modelNumber, p.category.id);
    }
}
