package com.warrantykeeper.exception;

import com.warrantykeeper.dto.ErrorResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.LinkedHashMap;
import java.util.Map;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.server.ServerExceptionMapper;

/** Maps exceptions to JSON error bodies. Stack traces are logged, never returned. */
public class GlobalExceptionHandler {

    private static final Logger LOG = Logger.getLogger(GlobalExceptionHandler.class);

    @ServerExceptionMapper
    public Response notFound(ResourceNotFoundException e) {
        return build(Response.Status.NOT_FOUND, e.getMessage(), Map.of());
    }

    @ServerExceptionMapper
    public Response conflict(ConflictException e) {
        return build(Response.Status.CONFLICT, e.getMessage(), Map.of());
    }

    @ServerExceptionMapper
    public Response badRequest(BadRequestException e) {
        return build(Response.Status.BAD_REQUEST, e.getMessage(), e.getFieldErrors());
    }

    @ServerExceptionMapper
    public Response validation(ConstraintViolationException e) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (ConstraintViolation<?> v : e.getConstraintViolations()) {
            String path = v.getPropertyPath().toString();
            String field = path.contains(".") ? path.substring(path.lastIndexOf('.') + 1) : path;
            errors.putIfAbsent(field, v.getMessage());
        }
        return build(Response.Status.BAD_REQUEST, "Validation failed", errors);
    }

    @ServerExceptionMapper
    public Response webApplication(WebApplicationException e) {
        int status = e.getResponse().getStatus();
        if (status >= 500) {
            LOG.error("Server error", e);
            return build(Response.Status.INTERNAL_SERVER_ERROR, "Something went wrong. Please try again.", Map.of());
        }
        return Response.status(status)
                .type(MediaType.APPLICATION_JSON)
                .entity(new ErrorResponse(status, e.getMessage(), Map.of()))
                .build();
    }

    @ServerExceptionMapper
    public Response unexpected(Throwable e) {
        LOG.error("Unexpected error", e);
        return build(Response.Status.INTERNAL_SERVER_ERROR, "Something went wrong. Please try again.", Map.of());
    }

    private Response build(Response.Status status, String message, Map<String, String> errors) {
        return Response.status(status)
                .type(MediaType.APPLICATION_JSON)
                .entity(new ErrorResponse(status.getStatusCode(), message, errors))
                .build();
    }
}
