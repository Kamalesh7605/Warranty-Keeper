package com.warrantykeeper.dto;

import com.warrantykeeper.entity.WarrantyPeriodUnit;
import com.warrantykeeper.entity.WarrantyStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ProductResponse(
        Long id,
        String name,
        String brand,
        String modelNumber,
        String serialNumber,
        String barcode,
        Long categoryId,
        String categoryName,
        LocalDate purchaseDate,
        BigDecimal purchasePrice,
        LocalDate warrantyStartDate,
        LocalDate warrantyExpiryDate,
        Integer warrantyPeriod,
        WarrantyPeriodUnit warrantyPeriodUnit,
        String storeSeller,
        String notes,
        WarrantyStatus warrantyStatus,
        Long daysUntilExpiry,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
