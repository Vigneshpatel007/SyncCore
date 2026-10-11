package com.synccore.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/** What the client may send when creating/updating a product (a DTO protects the entity). */
public record ProductRequest(
        @NotBlank(message = "Product name is required") String name,
        String category,
        @NotBlank(message = "SKU is required") String sku,
        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than 0") BigDecimal unitPrice,
        Long supplierId,
        @Min(value = 0, message = "Stock cannot be negative") Integer initialStock,
        @Min(value = 0, message = "Reorder level cannot be negative") Integer reorderLevel) { }
