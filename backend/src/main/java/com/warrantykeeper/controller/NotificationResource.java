package com.warrantykeeper.controller;

import com.warrantykeeper.dto.NotificationResponse;
import com.warrantykeeper.service.NotificationService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/notifications")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Notifications")
public class NotificationResource {

    @Inject
    NotificationService notificationService;

    @GET
    public List<NotificationResponse> list() {
        return notificationService.list();
    }

    @PUT
    @Path("/{id}/read")
    public NotificationResponse markRead(@PathParam("id") Long id) {
        return notificationService.markRead(id);
    }
}
