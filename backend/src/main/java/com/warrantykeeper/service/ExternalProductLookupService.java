package com.warrantykeeper.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.warrantykeeper.dto.ProductLookupResponse;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Optional;
import java.util.regex.Pattern;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

/**
 * Public product databases: UPCitemdb (general goods, free trial tier) then Open Food Facts.
 * Only numeric EAN/UPC codes are sent out; QR payloads and other text never leave the server.
 */
@ApplicationScoped
public class ExternalProductLookupService {

    private static final Logger LOG = Logger.getLogger(ExternalProductLookupService.class);
    private static final Pattern NUMERIC_CODE = Pattern.compile("^\\d{8,14}$");

    @ConfigProperty(name = "lookup.external.enabled", defaultValue = "true")
    boolean enabled;

    @Inject
    ObjectMapper mapper;

    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();

    public Optional<ProductLookupResponse> lookup(String barcode) {
        if (!enabled || barcode == null || !NUMERIC_CODE.matcher(barcode).matches()) {
            return Optional.empty();
        }
        String code = URLEncoder.encode(barcode, StandardCharsets.UTF_8);
        Optional<ProductLookupResponse> found = upcItemDb(barcode, code);
        return found.isPresent() ? found : openFoodFacts(barcode, code);
    }

    private Optional<ProductLookupResponse> upcItemDb(String barcode, String code) {
        JsonNode root = get("https://api.upcitemdb.com/prod/trial/lookup?upc=" + code);
        JsonNode item = root == null ? null : root.path("items").path(0);
        if (item == null || item.isMissingNode() || item.path("title").asText("").isBlank()) {
            return Optional.empty();
        }
        return Optional.of(new ProductLookupResponse(barcode, true, truncate(item.path("title").asText(), 200),
                blankToNull(item.path("brand").asText(null)), blankToNull(item.path("model").asText(null)), null));
    }

    private Optional<ProductLookupResponse> openFoodFacts(String barcode, String code) {
        JsonNode root = get("https://world.openfoodfacts.org/api/v2/product/" + code + ".json?fields=product_name,brands");
        if (root == null || root.path("status").asInt(0) != 1) {
            return Optional.empty();
        }
        String name = root.path("product").path("product_name").asText("");
        if (name.isBlank()) {
            return Optional.empty();
        }
        String brand = root.path("product").path("brands").asText("");
        return Optional.of(new ProductLookupResponse(barcode, true, truncate(name, 200),
                blankToNull(brand.split(",")[0].trim()), null, null));
    }

    private JsonNode get(String url) {
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(4))
                    .header("User-Agent", "WarrantyKeeper/1.0")
                    .GET().build();
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() == 200 ? mapper.readTree(response.body()) : null;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        } catch (Exception e) {
            LOG.debugf("External lookup failed for %s: %s", url, e.getMessage());
            return null;
        }
    }

    private static String truncate(String s, int max) {
        return s.length() > max ? s.substring(0, max) : s;
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() || "null".equals(s) ? null : s.trim();
    }
}
