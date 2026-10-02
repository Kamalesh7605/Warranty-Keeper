package com.warrantykeeper.controller;

import com.warrantykeeper.service.DocumentService;
import jakarta.inject.Inject;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/documents")
@Tag(name = "Documents")
public class DocumentResource {

    @Inject
    DocumentService documentService;

    /** {@code inline=true} lets the browser display PDFs/images instead of saving them. */
    @GET
    @Path("/{id}/download")
    public Response download(@PathParam("id") Long id, @QueryParam("inline") @DefaultValue("false") boolean inline) {
        DocumentService.StoredDocument stored = documentService.getFile(id);
        String encoded = URLEncoder.encode(stored.document().fileName, StandardCharsets.UTF_8).replace("+", "%20");
        String disposition = (inline ? "inline" : "attachment") + "; filename*=UTF-8''" + encoded;
        return Response.ok(stored.path().toFile(), stored.document().fileType)
                .header("Content-Disposition", disposition)
                .header("X-Content-Type-Options", "nosniff")
                .build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        documentService.delete(id);
        return Response.noContent().build();
    }
}
