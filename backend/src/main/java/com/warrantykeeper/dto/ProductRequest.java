package com.warrantykeeper.dto;

import com.warrantykeeper.entity.WarrantyPeriodUnit;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ProductRequest(
        @NotBlank(message = "Product name is required") @Size(max = 200) String name,
        @Size(max = 100) String brand,
        @Size(max = 100) String modelNumber,
        @Size(max = 100) String serialNumber,
        @Size(max = 100) String barcode,
        @NotNull(message = "Category is required") Long categoryId,
        @NotNull(message = "Purchase date is required") LocalDate purchaseDate,
        @DecimalMin(value = "0", message = "Purchase price must be 0 or more") BigDecimal purchasePrice,
        @Positive(message = "Warranty period must be greater than 0") Integer warrantyPeriod,
        WarrantyPeriodUnit warrantyPeriodUnit,
        /** Optional override; calculated from purchase date + period when omitted. */
        LocalDate warrantyExpiryDate,
        @Size(max = 150) String storeSeller,
        @Size(max = 1000) String notes) {
}
