package com.warrantykeeper.service;

import com.warrantykeeper.dto.NotificationResponse;
import com.warrantykeeper.entity.Notification;
import com.warrantykeeper.entity.NotificationType;
import com.warrantykeeper.entity.Product;
import com.warrantykeeper.exception.ResourceNotFoundException;
import com.warrantykeeper.repository.NotificationRepository;
import com.warrantykeeper.repository.ProductRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;

/**
 * In-app notifications. To add email/push later, call the extra channel from
 * {@link #createExpiringTomorrow(LocalDate)} right after a notification is created.
 */
@ApplicationScoped
public class NotificationService {

    private static final int LIST_LIMIT = 50;

    @Inject
    NotificationRepository notifications;

    @Inject
    ProductRepository products;

    public List<NotificationResponse> list() {
        return notifications.findLatest(LIST_LIMIT).stream().map(NotificationService::toResponse).toList();
    }

    @Transactional
    public NotificationResponse markRead(Long id) {
        Notification n = notifications.findById(id);
        if (n == null) {
            throw new ResourceNotFoundException("Notification not found.");
        }
        n.read = true;
        return toResponse(n);
    }

    /** Creates one notification per product whose warranty ends tomorrow. Idempotent per day. */
    @Transactional
    public int createExpiringTomorrow(LocalDate today) {
        LocalDate tomorrow = today.plusDays(1);
        int created = 0;
        for (Product p : products.findByExpiryDate(tomorrow)) {
            if (notifications.exists(p.id, NotificationType.WARRANTY_EXPIRING, today)) {
                continue;
            }
            Notification n = new Notification();
            n.product = p;
            n.type = NotificationType.WARRANTY_EXPIRING;
            n.message = p.name + " warranty expires tomorrow.";
            n.notificationDate = today;
            n.read = false;
            notifications.persist(n);
            created++;
        }
        return created;
    }

    static NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(n.id, n.product.id, n.type, n.message, n.notificationDate, n.read, n.createdAt);
    }
}
