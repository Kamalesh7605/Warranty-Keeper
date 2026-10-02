package com.warrantykeeper.security;

import jakarta.enterprise.context.ApplicationScoped;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

/** Single admin account (from config) and stateless HMAC-signed session tokens. */
@ApplicationScoped
public class AuthService {

    private static final Logger LOG = Logger.getLogger(AuthService.class);
    public static final String COOKIE_NAME = "wk_session";

    @ConfigProperty(name = "auth.enabled", defaultValue = "true")
    boolean enabled;

    @ConfigProperty(name = "auth.admin-username")
    String adminUsername;

    @ConfigProperty(name = "auth.admin-password")
    String adminPassword;

    @ConfigProperty(name = "auth.secret")
    java.util.Optional<String> secretConfig;

    @ConfigProperty(name = "auth.session-hours", defaultValue = "12")
    int sessionHours;

    @ConfigProperty(name = "auth.cookie-secure", defaultValue = "false")
    boolean cookieSecure;

    private byte[] secret;

    @jakarta.annotation.PostConstruct
    void init() {
        if (secretConfig.filter(s -> s.length() >= 16).isPresent()) {
            secret = secretConfig.get().getBytes(StandardCharsets.UTF_8);
        } else {
            secret = new byte[32];
            new SecureRandom().nextBytes(secret);
            LOG.warn("AUTH_SECRET is not set (or shorter than 16 chars): using a random key, sessions end on restart.");
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    public boolean isCookieSecure() {
        return cookieSecure;
    }

    public int sessionSeconds() {
        return (int) Duration.ofHours(sessionHours).toSeconds();
    }

    public boolean checkCredentials(String username, String password) {
        // Evaluate both so timing does not reveal which one was wrong.
        boolean userOk = constantTimeEquals(adminUsername, username);
        boolean passOk = constantTimeEquals(adminPassword, password);
        return userOk && passOk;
    }

    public String issueToken(String username) {
        String payload = username + "|" + Instant.now().plus(Duration.ofHours(sessionHours)).getEpochSecond();
        String encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        return encoded + "." + sign(encoded);
    }

    /** Returns the username when the token is authentic and unexpired. */
    public Optional<String> verifyToken(String token) {
        if (token == null) {
            return Optional.empty();
        }
        int dot = token.indexOf('.');
        if (dot < 1 || !constantTimeEquals(sign(token.substring(0, dot)), token.substring(dot + 1))) {
            return Optional.empty();
        }
        try {
            String payload = new String(Base64.getUrlDecoder().decode(token.substring(0, dot)), StandardCharsets.UTF_8);
            int bar = payload.lastIndexOf('|');
            long expires = Long.parseLong(payload.substring(bar + 1));
            return Instant.now().getEpochSecond() < expires ? Optional.of(payload.substring(0, bar)) : Optional.empty();
        } catch (RuntimeException e) {
            return Optional.empty();
        }
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) {
            return false;
        }
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }
}
