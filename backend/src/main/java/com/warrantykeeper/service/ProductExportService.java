package com.warrantykeeper.service;

import com.warrantykeeper.dto.ProductFilter;
import com.warrantykeeper.dto.ProductResponse;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;

@ApplicationScoped
public class ProductExportService {

    private static final String[] HEADER = {
        "Product Name", "Brand", "Model Number", "Serial Number", "Category", "Purchase Date",
        "Purchase Price", "Warranty Start Date", "Warranty Expiry Date", "Warranty Status",
        "Store / Seller", "Notes"
    };

    @Inject
    ProductService productService;

    public String exportCsv(ProductFilter filter) {
        StringBuilder sb = new StringBuilder("﻿"); // BOM so Excel opens UTF-8 correctly
        appendRow(sb, HEADER);
        List<ProductResponse> all = productService.list(filter);
        for (ProductResponse p : all) {
            appendRow(sb,
                    p.name(), p.brand(), p.modelNumber(), p.serialNumber(), p.categoryName(),
                    str(p.purchaseDate()), str(p.purchasePrice()), str(p.warrantyStartDate()),
                    str(p.warrantyExpiryDate()), p.warrantyStatus().name(), p.storeSeller(), p.notes());
        }
        return sb.toString();
    }

    private static void appendRow(StringBuilder sb, String... cells) {
        for (int i = 0; i < cells.length; i++) {
            if (i > 0) {
                sb.append(',');
            }
            sb.append(escape(cells[i]));
        }
        sb.append("\r\n");
    }

    /** RFC 4180 quoting plus neutralising spreadsheet formula injection. */
    static String escape(String value) {
        if (value == null) {
            return "";
        }
        String v = value;
        if (!v.isEmpty() && "=+-@\t\r".indexOf(v.charAt(0)) >= 0) {
            v = "'" + v;
        }
        if (v.contains(",") || v.contains("\"") || v.contains("\n") || v.contains("\r")) {
            v = "\"" + v.replace("\"", "\"\"") + "\"";
        }
        return v;
    }

    private static String str(Object o) {
        return o == null ? "" : o.toString();
    }
}
