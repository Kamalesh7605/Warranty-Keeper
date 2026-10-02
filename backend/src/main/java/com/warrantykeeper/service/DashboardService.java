package com.warrantykeeper.service;

import com.warrantykeeper.dto.DashboardResponse;
import com.warrantykeeper.entity.Product;
import com.warrantykeeper.entity.WarrantyStatus;
import com.warrantykeeper.repository.ProductRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.time.LocalDate;
import java.util.List;

@ApplicationScoped
public class DashboardService {

    @Inject
    ProductRepository products;

    @Inject
    WarrantyService warranty;

    public DashboardResponse summary() {
        LocalDate today = LocalDate.now();
        List<Product> all = products.listAll();
        long active = 0;
        long soon = 0;
        long expired = 0;
        for (Product p : all) {
            WarrantyStatus s = warranty.statusFor(p.warrantyExpiryDate, today);
            switch (s) {
                case ACTIVE -> active++;
                case EXPIRING_SOON, EXPIRES_TODAY -> soon++;
                case EXPIRED -> expired++;
                default -> { /* no warranty: counted in total only */ }
            }
        }
        return new DashboardResponse(all.size(), active, soon, expired);
    }
}
