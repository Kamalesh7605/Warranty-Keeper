package com.warrantykeeper.dto;

/** Result of a barcode lookup. When {@code found} is false only {@code barcode} is set. */
public record ProductLookupResponse(
        String barcode,
        boolean found,
        String name,
        String brand,
        String modelNumber,
        Long categoryId) {

    public static ProductLookupResponse notFound(String barcode) {
        return new ProductLookupResponse(barcode, false, null, null, null, null);
    }
}
