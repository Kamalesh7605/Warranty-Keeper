package com.warrantykeeper.service;

import com.warrantykeeper.entity.WarrantyPeriodUnit;
import com.warrantykeeper.entity.WarrantyStatus;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import org.eclipse.microprofile.config.inject.ConfigProperty;

/** Pure warranty date rules. Status is always derived, never stored. */
@ApplicationScoped
public class WarrantyService {

    @ConfigProperty(name = "warranty.expiring-soon-days", defaultValue = "7")
    int expiringSoonDays = 7;

    public int getExpiringSoonDays() {
        return expiringSoonDays;
    }

    public LocalDate calculateExpiry(LocalDate purchaseDate, Integer period, WarrantyPeriodUnit unit) {
        if (purchaseDate == null || period == null || unit == null) {
            return null;
        }
        return unit == WarrantyPeriodUnit.YEARS ? purchaseDate.plusYears(period) : purchaseDate.plusMonths(period);
    }

    public WarrantyStatus statusFor(LocalDate expiry, LocalDate today) {
        if (expiry == null) {
            return WarrantyStatus.NO_WARRANTY;
        }
        if (expiry.isBefore(today)) {
            return WarrantyStatus.EXPIRED;
        }
        if (expiry.isEqual(today)) {
            return WarrantyStatus.EXPIRES_TODAY;
        }
        if (!expiry.isAfter(today.plusDays(expiringSoonDays))) {
            return WarrantyStatus.EXPIRING_SOON;
        }
        return WarrantyStatus.ACTIVE;
    }

    public Long daysUntilExpiry(LocalDate expiry, LocalDate today) {
        return expiry == null ? null : ChronoUnit.DAYS.between(today, expiry);
    }
}
