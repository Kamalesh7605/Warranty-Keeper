package com.warrantykeeper.security;

import com.warrantykeeper.dto.ErrorResponse;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.CookieParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.NewCookie;
import jakarta.ws.rs.core.Response;
import java.util.Map;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Auth")
public class AuthResource {

    public record LoginRequest(@NotBlank(message = "Username is required") String username,
                               @NotBlank(message = "Password is required") String password) {
    }

    public record SessionResponse(String username) {
    }

    @Inject
    AuthService auth;

    @POST
    @Path("/login")
    public Response login(@Valid LoginRequest request) throws InterruptedException {
        if (!auth.checkCredentials(request.username(), request.password())) {
            Thread.sleep(500); // slows down password guessing
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse(401, "Invalid username or password.", Map.of())).build();
        }
        return Response.ok(new SessionResponse(request.username()))
                .cookie(sessionCookie(auth.issueToken(request.username()), auth.sessionSeconds())).build();
    }

    @POST
    @Path("/logout")
    @Consumes(MediaType.WILDCARD)
    public Response logout() {
        return Response.noContent().cookie(sessionCookie("", 0)).build();
    }

    /** Behind the auth filter, so a 200 means "signed in". */
    @GET
    @Path("/me")
    public SessionResponse me(@CookieParam(AuthService.COOKIE_NAME) String token) {
        return new SessionResponse(auth.verifyToken(token).orElse("admin"));
    }

    private NewCookie sessionCookie(String value, int maxAge) {
        return new NewCookie.Builder(AuthService.COOKIE_NAME).value(value).path("/").maxAge(maxAge)
                .httpOnly(true).secure(auth.isCookieSecure()).sameSite(NewCookie.SameSite.LAX).build();
    }
}
