package com.warrantykeeper.security;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.QuarkusTestProfile;
import io.quarkus.test.junit.TestProfile;
import io.restassured.http.ContentType;
import java.util.Map;
import org.junit.jupiter.api.Test;

@QuarkusTest
@TestProfile(AuthApiTest.AuthOn.class)
class AuthApiTest {

    public static class AuthOn implements QuarkusTestProfile {
        @Override
        public Map<String, String> getConfigOverrides() {
            return Map.of("auth.enabled", "true", "auth.admin-username", "admin",
                    "auth.admin-password", "s3cret-pass", "auth.secret", "test-secret-test-secret-123");
        }
    }

    private String login(String user, String pass, int status) {
        return given().contentType(ContentType.JSON).body(Map.of("username", user, "password", pass))
                .post("/api/auth/login").then().statusCode(status).extract().cookie(AuthService.COOKIE_NAME);
    }

    @Test
    void apiRequiresSignIn() {
        given().get("/api/products").then().statusCode(401);
        given().get("/api/dashboard/summary").then().statusCode(401);
        given().cookie(AuthService.COOKIE_NAME, "forged.token").get("/api/products").then().statusCode(401);
    }

    @Test
    void wrongPasswordIsRejected() {
        given().contentType(ContentType.JSON).body(Map.of("username", "admin", "password", "nope"))
                .post("/api/auth/login").then().statusCode(401).body("message", equalTo("Invalid username or password."));
    }

    @Test
    void loginGrantsAccessAndLogoutClearsCookie() {
        String token = login("admin", "s3cret-pass", 200);
        assertTrue(token != null && !token.isBlank());
        given().cookie(AuthService.COOKIE_NAME, token).get("/api/products").then().statusCode(200);
        given().cookie(AuthService.COOKIE_NAME, token).get("/api/auth/me").then().statusCode(200).body("username", equalTo("admin"));
        assertEquals("", given().post("/api/auth/logout").then().statusCode(204).extract().cookie(AuthService.COOKIE_NAME));
    }

    @Test
    void tamperedTokenIsRejected() {
        String token = login("admin", "s3cret-pass", 200);
        String tampered = token.substring(0, token.length() - 2) + (token.endsWith("AA") ? "BB" : "AA");
        given().cookie(AuthService.COOKIE_NAME, tampered).get("/api/products").then().statusCode(401);
    }
}
