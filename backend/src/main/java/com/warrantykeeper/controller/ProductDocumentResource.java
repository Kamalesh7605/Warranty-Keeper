package com.warrantykeeper.controller;

import com.warrantykeeper.dto.DocumentResponse;
import com.warrantykeeper.service.DocumentService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.util.List;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

/** Document list/upload for one product. (Download/delete live in {@link DocumentResource}.) */
@Path("/api/products/{productId}/documents")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Documents")
public class ProductDocumentResource {

    @Inject
    DocumentService documentService;

    @GET
    public List<DocumentResponse> list(@PathParam("productId") Long productId) {
        return documentService.list(productId);
    }

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response upload(@PathParam("productId") Long productId,
                           @RestForm("file") FileUpload file,
                           @RestForm("documentType") String documentType) {
        DocumentResponse created = documentService.upload(productId, file, documentType);
        return Response.created(URI.create("/api/documents/" + created.id() + "/download")).entity(created).build();
    }
}
