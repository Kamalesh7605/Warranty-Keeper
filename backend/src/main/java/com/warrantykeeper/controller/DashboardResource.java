package com.warrantykeeper.controller;

import com.warrantykeeper.dto.DashboardResponse;
import com.warrantykeeper.dto.ProductResponse;
import com.warrantykeeper.service.DashboardService;
import com.warrantykeeper.service.ProductService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/dashboard")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Dashboard")
public class DashboardResource {

    @Inject
    DashboardService dashboardService;

    @Inject
    ProductService productService;

    @GET
    @Path("/summary")
    public DashboardResponse summary() {
        return dashboardService.summary();
    }

    @GET
    @Path("/expiring")
    public List<ProductResponse> expiring() {
        return productService.expiringSoon();
    }
}
