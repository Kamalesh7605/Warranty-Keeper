package com.warrantykeeper.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false, length = 200)
    public String name;

    @Column(length = 100)
    public String brand;

    @Column(name = "model_number", length = 100)
    public String modelNumber;

    @Column(name = "serial_number", length = 100)
    public String serialNumber;

    @Column(length = 100)
    public String barcode;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    public Category category;

    @Column(name = "purchase_date", nullable = false)
    public LocalDate purchaseDate;

    @Column(name = "purchase_price", precision = 12, scale = 2)
    public BigDecimal purchasePrice;

    @Column(name = "warranty_start_date")
    public LocalDate warrantyStartDate;

    @Column(name = "warranty_expiry_date")
    public LocalDate warrantyExpiryDate;

    @Column(name = "warranty_period")
    public Integer warrantyPeriod;

    @Enumerated(EnumType.STRING)
    @Column(name = "warranty_period_unit", length = 10)
    public WarrantyPeriodUnit warrantyPeriodUnit;

    @Column(name = "store_seller", length = 150)
    public String storeSeller;

    @Column(length = 1000)
    public String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
