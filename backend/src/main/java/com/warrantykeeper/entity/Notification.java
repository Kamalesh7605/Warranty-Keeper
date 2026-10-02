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
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    public Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    public NotificationType type;

    @Column(nullable = false)
    public String message;

    @Column(name = "notification_date", nullable = false)
    public LocalDate notificationDate;

    /** "read" is a reserved word in MySQL, hence the column name. */
    @Column(name = "is_read", nullable = false)
    public boolean read;

    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
