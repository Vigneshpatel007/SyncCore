package com.synccore.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InventoryUpdateRequest(
        @NotNull(message = "Quantity is required") @Min(value = 0, message = "Quantity cannot be negative") Integer quantity,
        @NotNull(message = "Reorder level is required") @Min(value = 0, message = "Reorder level cannot be negative") Integer reorderLevel) { }
