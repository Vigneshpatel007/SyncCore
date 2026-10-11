package com.synccore.service;

import com.synccore.dto.ProductRequest;
import com.synccore.entity.Inventory;
import com.synccore.entity.Product;
import com.synccore.exception.BusinessException;
import com.synccore.exception.ResourceNotFoundException;
import com.synccore.repository.InventoryRepository;
import com.synccore.repository.ProductRepository;
import com.synccore.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;

    public ProductService(ProductRepository productRepository, SupplierRepository supplierRepository,
                          InventoryRepository inventoryRepository) {
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.inventoryRepository = inventoryRepository;
    }

    public List<Product> findAll() { return productRepository.findAll(); }

    public Product findById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    /** @Transactional: product + its stock record are saved together, or neither is. */
    @Transactional
    public Product create(ProductRequest req) {
        if (productRepository.existsBySku(req.sku())) throw new BusinessException("SKU '" + req.sku() + "' is already in use");
        Product p = new Product();
        apply(p, req);
        p = productRepository.save(p);

        Inventory inv = new Inventory();                 // every product gets exactly one stock record
        inv.setProduct(p);
        inv.setQuantity(req.initialStock() == null ? 0 : req.initialStock());
        inv.setReorderLevel(req.reorderLevel() == null ? 10 : req.reorderLevel());
        inventoryRepository.save(inv);
        return p;
    }

    @Transactional
    public Product update(Long id, ProductRequest req) {
        Product p = findById(id);
        if (!p.getSku().equals(req.sku()) && productRepository.existsBySku(req.sku()))
            throw new BusinessException("SKU '" + req.sku() + "' is already in use");
        apply(p, req);
        return productRepository.save(p);
    }

    @Transactional
    public void delete(Long id) {
        Product p = findById(id);
        inventoryRepository.findByProductId(id).ifPresent(inventoryRepository::delete);
        productRepository.delete(p);
        productRepository.flush(); // fails (409) if past orders still reference this product
    }

    private void apply(Product p, ProductRequest req) {
        p.setName(req.name());
        p.setCategory(req.category());
        p.setSku(req.sku());
        p.setUnitPrice(req.unitPrice());
        p.setSupplier(req.supplierId() == null ? null : supplierRepository.findById(req.supplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", req.supplierId())));
    }
}
