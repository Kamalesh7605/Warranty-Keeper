package com.warrantykeeper.dto;

import com.warrantykeeper.entity.NotificationType;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        Long productId,
        NotificationType type,
        String message,
        LocalDate notificationDate,
        boolean read,
        LocalDateTime createdAt) {
}
