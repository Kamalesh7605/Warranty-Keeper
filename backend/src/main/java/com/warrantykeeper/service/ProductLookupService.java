package com.warrantykeeper.service;

import com.warrantykeeper.dto.ProductLookupResponse;

/**
 * Resolves a scanned barcode / QR value to product details.
 * <p>
 * {@link CompositeProductLookupService} tries the local database first, then public product
 * databases. Failures of an external source are swallowed so the UI can fall back to manual entry.
 */
public interface ProductLookupService {

    /** Never returns null: use {@link ProductLookupResponse#notFound(String)} when nothing is known. */
    ProductLookupResponse lookup(String barcode);
}
