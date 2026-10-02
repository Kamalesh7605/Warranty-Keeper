package com.warrantykeeper.dto;

import com.warrantykeeper.entity.DocumentType;
import java.time.LocalDateTime;

public record DocumentResponse(
        Long id,
        Long productId,
        String fileName,
        String fileType,
        DocumentType documentType,
        long fileSize,
        LocalDateTime createdAt) {
}
