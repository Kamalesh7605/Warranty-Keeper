package com.warrantykeeper.security;

import com.warrantykeeper.dto.ErrorResponse;
import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Cookie;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;
import java.util.Optional;
import org.jboss.resteasy.reactive.server.ServerRequestFilter;

/** Requires a valid session cookie for every /api call except login/logout. */
public class AuthFilter {

    @Inject
    AuthService auth;

    @ServerRequestFilter
    public Optional<Response> check(ContainerRequestContext ctx) {
        String path = ctx.getUriInfo().getPath();
        if (!auth.isEnabled() || !path.startsWith("/api/") || path.equals("/api/auth/login")
                || path.equals("/api/auth/logout") || "OPTIONS".equals(ctx.getMethod())) {
            return Optional.empty();
        }
        Cookie cookie = ctx.getCookies().get(AuthService.COOKIE_NAME);
        if (cookie != null && auth.verifyToken(cookie.getValue()).isPresent()) {
            return Optional.empty();
        }
        return Optional.of(Response.status(Response.Status.UNAUTHORIZED).type(MediaType.APPLICATION_JSON)
                .entity(new ErrorResponse(401, "Please sign in.", Map.of())).build());
    }
}
