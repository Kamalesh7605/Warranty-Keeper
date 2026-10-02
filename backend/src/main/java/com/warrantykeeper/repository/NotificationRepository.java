package com.warrantykeeper.repository;

import com.warrantykeeper.entity.Notification;
import com.warrantykeeper.entity.NotificationType;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDate;
import java.util.List;

@ApplicationScoped
public class NotificationRepository implements PanacheRepository<Notification> {

    public List<Notification> findLatest(int limit) {
        return findAll(Sort.by("createdAt").descending().and("id").descending()).page(Page.ofSize(limit)).list();
    }

    public boolean exists(Long productId, NotificationType type, LocalDate date) {
        return count("product.id = ?1 and type = ?2 and notificationDate = ?3", productId, type, date) > 0;
    }
}
