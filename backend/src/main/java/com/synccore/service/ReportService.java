package com.synccore.service;

import com.synccore.dto.SalesPoint;
import com.synccore.dto.Summary;
import com.synccore.dto.TopProduct;
import com.synccore.entity.OrderStatus;
import com.synccore.repository.*;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

/** Reports & analytics: aggregation happens in the database through JPQL queries. */
@Service
public class ReportService {
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final EmployeeRepository employeeRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final InventoryRepository inventoryRepository;

    public ReportService(ProductRepository productRepository, CustomerRepository customerRepository,
                         SupplierRepository supplierRepository, EmployeeRepository employeeRepository,
                         OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                         InventoryRepository inventoryRepository) {
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.supplierRepository = supplierRepository;
        this.employeeRepository = employeeRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.inventoryRepository = inventoryRepository;
    }

    /** @Cacheable: computed once, then served from memory until an order/stock change evicts it. */
    @Cacheable("dashboard")
    public Summary summary() {
        BigDecimal revenue = orderRepository.sumRevenue(OrderStatus.COMPLETED);
        return new Summary(productRepository.count(), customerRepository.count(), supplierRepository.count(),
                employeeRepository.count(), orderRepository.count(), inventoryRepository.countLowStock(),
                revenue == null ? BigDecimal.ZERO : revenue);
    }

    public List<SalesPoint> salesByDate() { return orderRepository.salesByDate(OrderStatus.COMPLETED); }

    public List<TopProduct> topProducts() {
        return orderItemRepository.topProducts(OrderStatus.COMPLETED, PageRequest.of(0, 5));
    }
}
