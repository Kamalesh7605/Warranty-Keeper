package com.warrantykeeper.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class ProductExportServiceTest {

    @Test
    void quotesSpecialCharacters() {
        assertEquals("\"Samsung 55\"\" TV, black\"", ProductExportService.escape("Samsung 55\" TV, black"));
    }

    @Test
    void neutralisesFormulas() {
        assertEquals("'=SUM(A1)", ProductExportService.escape("=SUM(A1)"));
    }

    @Test
    void nullBecomesEmpty() {
        assertEquals("", ProductExportService.escape(null));
    }
}
