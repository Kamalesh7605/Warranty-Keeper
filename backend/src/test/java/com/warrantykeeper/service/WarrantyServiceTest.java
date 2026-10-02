package com.warrantykeeper.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.warrantykeeper.entity.WarrantyPeriodUnit;
import com.warrantykeeper.entity.WarrantyStatus;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class WarrantyServiceTest {

    private final WarrantyService service = new WarrantyService();
    private final LocalDate today = LocalDate.of(2026, 9, 30);

    @Test
    void expiryAddsYears() {
        assertEquals(LocalDate.of(2026, 10, 1),
                service.calculateExpiry(LocalDate.of(2025, 10, 1), 1, WarrantyPeriodUnit.YEARS));
    }

    @Test
    void expiryAddsMonthsAndClampsToMonthEnd() {
        assertEquals(LocalDate.of(2026, 2, 28),
                service.calculateExpiry(LocalDate.of(2025, 11, 30), 3, WarrantyPeriodUnit.MONTHS));
    }

    @Test
    void expiryIsNullWithoutPeriod() {
        assertNull(service.calculateExpiry(today, null, WarrantyPeriodUnit.YEARS));
    }

    @Test
    void statusRules() {
        assertEquals(WarrantyStatus.EXPIRED, service.statusFor(today.minusDays(1), today));
        assertEquals(WarrantyStatus.EXPIRES_TODAY, service.statusFor(today, today));
        assertEquals(WarrantyStatus.EXPIRING_SOON, service.statusFor(today.plusDays(1), today));
        assertEquals(WarrantyStatus.EXPIRING_SOON, service.statusFor(today.plusDays(7), today));
        assertEquals(WarrantyStatus.ACTIVE, service.statusFor(today.plusDays(8), today));
        assertEquals(WarrantyStatus.NO_WARRANTY, service.statusFor(null, today));
    }

    @Test
    void daysUntilExpiry() {
        assertEquals(5L, service.daysUntilExpiry(today.plusDays(5), today));
        assertNull(service.daysUntilExpiry(null, today));
    }
}
