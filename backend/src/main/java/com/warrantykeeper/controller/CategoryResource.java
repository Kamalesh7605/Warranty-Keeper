package com.warrantykeeper.controller;

import com.warrantykeeper.dto.CategoryRequest;
import com.warrantykeeper.dto.CategoryResponse;
import com.warrantykeeper.service.CategoryService;
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
import java.util.List;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Categories")
public class CategoryResource {

    @Inject
    CategoryService categoryService;

    @GET
    public List<CategoryResponse> list() {
        return categoryService.list();
    }

    @POST
    public Response create(@Valid CategoryRequest request) {
        CategoryResponse created = categoryService.create(request);
        return Response.created(URI.create("/api/categories/" + created.id())).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    public CategoryResponse update(@PathParam("id") Long id, @Valid CategoryRequest request) {
        return categoryService.update(id, request);
    }

    /** Responds 409 when products use the category, unless {@code reassignTo} names another category. */
    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id, @QueryParam("reassignTo") Long reassignTo) {
        categoryService.delete(id, reassignTo);
        return Response.noContent().build();
    }
}
