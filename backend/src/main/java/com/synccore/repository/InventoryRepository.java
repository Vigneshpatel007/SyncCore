package com.synccore.repository;

import com.synccore.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductId(Long productId);

    // JPQL: written against Java classes/fields, not table/column names
    @Query("select i from Inventory i where i.quantity <= i.reorderLevel order by i.quantity")
    List<Inventory> findLowStock();

    @Query("select count(i) from Inventory i where i.quantity <= i.reorderLevel")
    long countLowStock();
}
