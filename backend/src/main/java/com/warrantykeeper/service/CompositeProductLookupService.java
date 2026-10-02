package com.warrantykeeper.service;

import com.warrantykeeper.dto.ProductLookupResponse;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/** Local database first (your own earlier entries), then public product databases. */
@ApplicationScoped
public class CompositeProductLookupService implements ProductLookupService {

    @Inject
    LocalProductLookupService local;

    @Inject
    ExternalProductLookupService external;

    @Override
    public ProductLookupResponse lookup(String barcode) {
        ProductLookupResponse fromLocal = local.lookup(barcode);
        if (fromLocal.found()) {
            return fromLocal;
        }
        return external.lookup(fromLocal.barcode() == null ? null : fromLocal.barcode().trim())
                .orElse(fromLocal);
    }
}
