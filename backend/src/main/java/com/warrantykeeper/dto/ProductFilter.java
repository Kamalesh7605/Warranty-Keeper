package com.warrantykeeper.dto;

import com.warrantykeeper.entity.WarrantyStatus;
import java.time.LocalDate;

/** Optional criteria shared by the product list and the CSV export. Null means "no restriction". */
public record ProductFilter(
        String search,
        Long categoryId,
        WarrantyStatus status,
        LocalDate purchaseFrom,
        LocalDate purchaseTo,
        LocalDate expiryFrom,
        LocalDate expiryTo) {

    public static ProductFilter none() {
        return new ProductFilter(null, null, null, null, null, null, null);
    }
}
