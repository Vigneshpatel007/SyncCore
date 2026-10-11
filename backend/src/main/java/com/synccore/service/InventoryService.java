package com.synccore.service;

import com.synccore.dto.InventoryUpdateRequest;
import com.synccore.entity.Inventory;
import com.synccore.exception.ResourceNotFoundException;
import com.synccore.repository.InventoryRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class InventoryService {
    private final InventoryRepository repo;

    public InventoryService(InventoryRepository repo) { this.repo = repo; }

    public List<Inventory> findAll() { return repo.findAll(); }

    public List<Inventory> findLowStock() { return repo.findLowStock(); }

    @CacheEvict(value = "dashboard", allEntries = true) // stock changed -> cached dashboard numbers are stale
    public Inventory update(Long id, InventoryUpdateRequest req) {
        Inventory inv = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Inventory record", id));
        inv.setQuantity(req.quantity());
        inv.setReorderLevel(req.reorderLevel());
        return repo.save(inv);
    }
}
