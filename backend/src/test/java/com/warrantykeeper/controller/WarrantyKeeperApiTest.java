package com.warrantykeeper.controller;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasItem;
import static org.junit.jupiter.api.Assertions.assertEquals;

import com.warrantykeeper.service.NotificationService;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import jakarta.inject.Inject;
import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.Test;

@QuarkusTest
class WarrantyKeeperApiTest {

    @Inject
    NotificationService notificationService;

    private static final byte[] PDF = "%PDF-1.4 test".getBytes();

    private int createCategory(String name) {
        return given().contentType(ContentType.JSON).body(Map.of("name", name))
                .post("/api/categories").then().statusCode(201).extract().path("id");
    }

    private Map<String, Object> product(int categoryId, String name) {
        return Map.of("name", name, "categoryId", categoryId, "purchaseDate", "2024-01-15",
                "warrantyPeriod", 1, "warrantyPeriodUnit", "YEARS", "purchasePrice", 45000);
    }

    private int createProduct(Map<String, Object> body) {
        return given().contentType(ContentType.JSON).body(body)
                .post("/api/products").then().statusCode(201).extract().path("id");
    }

    @Test
    void productCrudAndExpiryCalculation() {
        int cat = createCategory("CRUD-" + System.nanoTime());
        int id = createProduct(Map.of("name", "Samsung TV", "categoryId", cat, "purchaseDate", "2025-10-01",
                "warrantyPeriod", 1, "warrantyPeriodUnit", "YEARS", "purchasePrice", 45000));

        given().get("/api/products/" + id).then().statusCode(200)
                .body("name", equalTo("Samsung TV"))
                .body("warrantyExpiryDate", equalTo("2026-10-01"))
                .body("warrantyStartDate", equalTo("2025-10-01"));

        given().contentType(ContentType.JSON)
                .body(Map.of("name", "Samsung TV 2", "categoryId", cat, "purchaseDate", "2025-10-01",
                        "warrantyPeriod", 6, "warrantyPeriodUnit", "MONTHS"))
                .put("/api/products/" + id).then().statusCode(200)
                .body("name", equalTo("Samsung TV 2"))
                .body("warrantyExpiryDate", equalTo("2026-04-01"))
                .body("warrantyStatus", equalTo("EXPIRED"));

        given().delete("/api/products/" + id).then().statusCode(204);
        given().get("/api/products/" + id).then().statusCode(404).body("message", equalTo("Product not found."));
    }

    @Test
    void productValidation() {
        int cat = createCategory("VAL-" + System.nanoTime());
        given().contentType(ContentType.JSON).body(Map.of("categoryId", cat))
                .post("/api/products").then().statusCode(400);
        given().contentType(ContentType.JSON)
                .body(Map.of("name", "X", "categoryId", cat, "purchaseDate", "2025-10-01",
                        "warrantyExpiryDate", "2025-09-01"))
                .post("/api/products").then().statusCode(400)
                .body("errors.warrantyExpiryDate", containsString("on or after"));
        given().contentType(ContentType.JSON)
                .body(Map.of("name", "X", "categoryId", cat, "purchaseDate", "2025-10-01", "purchasePrice", -5))
                .post("/api/products").then().statusCode(400);
    }

    @Test
    void categoryInUseCannotBeDeletedUntilReassigned() {
        int from = createCategory("From-" + System.nanoTime());
        int to = createCategory("To-" + System.nanoTime());
        int productId = createProduct(product(from, "Laptop"));

        given().delete("/api/categories/" + from).then().statusCode(409);
        given().delete("/api/categories/" + from + "?reassignTo=" + to).then().statusCode(204);
        given().get("/api/products/" + productId).then().body("categoryId", equalTo(to));
    }

    @Test
    void duplicateCategoryNameIsConflict() {
        String name = "Dup-" + System.nanoTime();
        createCategory(name);
        given().contentType(ContentType.JSON).body(Map.of("name", name.toUpperCase()))
                .post("/api/categories").then().statusCode(409);
    }

    @Test
    void documentUploadValidationAndDelete() {
        int cat = createCategory("Doc-" + System.nanoTime());
        int id = createProduct(product(cat, "Fridge"));

        given().multiPart("file", "bill.pdf", PDF, "application/pdf").multiPart("documentType", "PURCHASE_BILL")
                .post("/api/products/" + id + "/documents").then().statusCode(201)
                .body("fileName", equalTo("bill.pdf")).body("documentType", equalTo("PURCHASE_BILL"));

        given().multiPart("file", "evil.exe", PDF, "application/octet-stream")
                .post("/api/products/" + id + "/documents").then().statusCode(400);
        given().multiPart("file", "fake.pdf", "not a pdf".getBytes(), "application/pdf")
                .post("/api/products/" + id + "/documents").then().statusCode(400);

        int docId = given().get("/api/products/" + id + "/documents").then().statusCode(200)
                .body("size()", equalTo(1)).extract().path("[0].id");
        given().get("/api/documents/" + docId + "/download").then().statusCode(200)
                .header("Content-Disposition", containsString("attachment"));

        given().delete("/api/documents/" + docId).then().statusCode(204);
        given().get("/api/documents/" + docId + "/download").then().statusCode(404);
    }

    @Test
    void deletingProductRemovesDocuments() {
        int cat = createCategory("Del-" + System.nanoTime());
        int id = createProduct(product(cat, "Mixer"));
        given().multiPart("file", "card.pdf", PDF, "application/pdf").multiPart("documentType", "WARRANTY_CARD")
                .post("/api/products/" + id + "/documents").then().statusCode(201);
        int docId = given().get("/api/products/" + id + "/documents").then().extract().path("[0].id");

        given().delete("/api/products/" + id).then().statusCode(204);
        given().get("/api/documents/" + docId + "/download").then().statusCode(404);
    }

    @Test
    void dashboardAndExpiringAndExport() {
        int cat = createCategory("Dash-" + System.nanoTime());
        LocalDate purchase = LocalDate.now().minusYears(1).plusDays(5);
        int id = createProduct(Map.of("name", "Soon, \"quoted\"", "categoryId", cat,
                "purchaseDate", purchase.toString(), "warrantyPeriod", 1, "warrantyPeriodUnit", "YEARS"));

        given().get("/api/dashboard/summary").then().statusCode(200)
                .body("totalProducts", greaterThanOrEqualTo(1)).body("expiringSoon", greaterThanOrEqualTo(1));
        given().get("/api/dashboard/expiring").then().statusCode(200).body("id", hasItem(id));

        given().get("/api/products/export").then().statusCode(200)
                .contentType(containsString("text/csv"))
                .header("Content-Disposition", containsString("warranty-products-" + LocalDate.now() + ".csv"))
                .body(containsString("Product Name,Brand"))
                .body(containsString("\"Soon, \"\"quoted\"\"\""));
    }

    @Test
    void notificationCreatedOnceForProductExpiringTomorrow() {
        int cat = createCategory("Notif-" + System.nanoTime());
        LocalDate purchase = LocalDate.now().minusYears(1).plusDays(1);
        createProduct(Map.of("name", "Kettle-" + System.nanoTime(), "categoryId", cat,
                "purchaseDate", purchase.toString(), "warrantyPeriod", 1, "warrantyPeriodUnit", "YEARS"));

        assertEquals(1, notificationService.createExpiringTomorrow(LocalDate.now()));
        assertEquals(0, notificationService.createExpiringTomorrow(LocalDate.now()));

        int notifId = given().get("/api/notifications").then().statusCode(200)
                .body("[0].message", containsString("warranty expires tomorrow"))
                .body("[0].read", equalTo(false)).extract().path("[0].id");
        given().put("/api/notifications/" + notifId + "/read").then().statusCode(200).body("read", equalTo(true));
    }

    @Test
    void lookupFallsBackToNotFoundThenFindsSavedBarcode() {
        String code = "89012" + System.nanoTime();
        given().queryParam("barcode", code).get("/api/products/lookup").then().statusCode(200)
                .body("found", equalTo(false)).body("barcode", equalTo(code));

        int cat = createCategory("Scan-" + System.nanoTime());
        createProduct(Map.of("name", "Scanned Item", "brand", "Acme", "barcode", code, "categoryId", cat,
                "purchaseDate", "2025-10-01"));
        given().queryParam("barcode", code).get("/api/products/lookup").then().statusCode(200)
                .body("found", equalTo(true)).body("name", equalTo("Scanned Item")).body("brand", equalTo("Acme"));
    }

    @Test
    void exportAndListHonourFilters() {
        int cat = createCategory("Filt-" + System.nanoTime());
        String tag = "FilterItem" + System.nanoTime();
        createProduct(Map.of("name", tag + "-old", "categoryId", cat, "purchaseDate", "2020-01-10",
                "warrantyPeriod", 1, "warrantyPeriodUnit", "YEARS"));
        createProduct(Map.of("name", tag + "-new", "categoryId", cat, "purchaseDate", "2024-06-01",
                "warrantyPeriod", 10, "warrantyPeriodUnit", "YEARS"));

        given().queryParam("search", tag).get("/api/products").then().body("size()", equalTo(2));
        given().queryParam("search", tag).queryParam("status", "EXPIRED").get("/api/products").then()
                .body("size()", equalTo(1)).body("[0].name", equalTo(tag + "-old"));
        given().queryParam("search", tag).queryParam("purchaseFrom", "2023-01-01").get("/api/products").then()
                .body("size()", equalTo(1)).body("[0].name", equalTo(tag + "-new"));
        given().queryParam("search", tag).queryParam("expiryTo", "2022-01-01").get("/api/products").then()
                .body("size()", equalTo(1)).body("[0].name", equalTo(tag + "-old"));

        String csv = given().queryParam("search", tag).queryParam("categoryId", cat).queryParam("status", "ACTIVE")
                .get("/api/products/export").then().statusCode(200).extract().asString();
        org.junit.jupiter.api.Assertions.assertTrue(csv.contains(tag + "-new"));
        org.junit.jupiter.api.Assertions.assertFalse(csv.contains(tag + "-old"));
    }
}
