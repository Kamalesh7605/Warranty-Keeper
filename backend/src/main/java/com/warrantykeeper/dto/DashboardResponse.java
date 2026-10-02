package com.warrantykeeper.dto;

public record DashboardResponse(long totalProducts, long activeWarranty, long expiringSoon, long expired) {
}
