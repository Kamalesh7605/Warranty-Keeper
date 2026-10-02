package com.warrantykeeper.entity;

/** Derived from the expiry date; never persisted. */
public enum WarrantyStatus {
    ACTIVE, EXPIRING_SOON, EXPIRES_TODAY, EXPIRED, NO_WARRANTY
}
