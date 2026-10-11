package com.synccore.controller;

import com.synccore.dto.InventoryUpdateRequest;
import com.synccore.entity.Inventory;
import com.synccore.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    private final InventoryService service;

    public InventoryController(InventoryService service) { this.service = service; }

    @GetMapping
    public List<Inventory> all() { return service.findAll(); }

    @GetMapping("/low-stock")                    // items at or below the reorder level
    public List<Inventory> lowStock() { return service.findLowStock(); }

    @PutMapping("/{id}")
    public Inventory update(@PathVariable Long id, @Valid @RequestBody InventoryUpdateRequest request) {
        return service.update(id, request);
    }
}
