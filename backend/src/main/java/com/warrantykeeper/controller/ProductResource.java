package com.warrantykeeper.controller;

import com.warrantykeeper.dto.ProductFilter;
import com.warrantykeeper.dto.ProductLookupResponse;
import com.warrantykeeper.dto.ProductRequest;
import com.warrantykeeper.dto.ProductResponse;
import com.warrantykeeper.entity.WarrantyStatus;
import com.warrantykeeper.service.ProductExportService;
import com.warrantykeeper.service.ProductLookupService;
import com.warrantykeeper.service.ProductService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Products")
public class ProductResource {

    @Inject
    ProductService productService;

    @Inject
    ProductExportService exportService;

    @Inject
    ProductLookupService lookupService;

    @GET
    public List<ProductResponse> list(@QueryParam("search") String search,
                                      @QueryParam("categoryId") Long categoryId,
                                      @QueryParam("status") WarrantyStatus status,
                                      @QueryParam("purchaseFrom") LocalDate purchaseFrom,
                                      @QueryParam("purchaseTo") LocalDate purchaseTo,
                                      @QueryParam("expiryFrom") LocalDate expiryFrom,
                                      @QueryParam("expiryTo") LocalDate expiryTo) {
        return productService.list(new ProductFilter(search, categoryId, status, purchaseFrom, purchaseTo, expiryFrom, expiryTo));
    }

    @GET
    @Path("/lookup")
    public ProductLookupResponse lookup(@QueryParam("barcode") String barcode) {
        return lookupService.lookup(barcode);
    }

    @GET
    @Path("/export")
    @Produces("text/csv")
    public Response export(@QueryParam("search") String search,
                           @QueryParam("categoryId") Long categoryId,
                           @QueryParam("status") WarrantyStatus status,
                           @QueryParam("purchaseFrom") LocalDate purchaseFrom,
                           @QueryParam("purchaseTo") LocalDate purchaseTo,
                           @QueryParam("expiryFrom") LocalDate expiryFrom,
                           @QueryParam("expiryTo") LocalDate expiryTo) {
        String filename = "warranty-products-" + LocalDate.now() + ".csv";
        ProductFilter filter = new ProductFilter(search, categoryId, status, purchaseFrom, purchaseTo, expiryFrom, expiryTo);
        return Response.ok(exportService.exportCsv(filter), "text/csv; charset=UTF-8")
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .build();
    }

    @GET
    @Path("/{id}")
    public ProductResponse get(@PathParam("id") Long id) {
        return productService.get(id);
    }

    @POST
    public Response create(@Valid ProductRequest request) {
        ProductResponse created = productService.create(request);
        return Response.created(URI.create("/api/products/" + created.id())).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    public ProductResponse update(@PathParam("id") Long id, @Valid ProductRequest request) {
        return productService.update(id, request);
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        productService.delete(id);
        return Response.noContent().build();
    }
}
