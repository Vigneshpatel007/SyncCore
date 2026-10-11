package com.synccore.service;

import com.synccore.dto.OrderItemRequest;
import com.synccore.dto.OrderRequest;
import com.synccore.entity.*;
import com.synccore.exception.BusinessException;
import com.synccore.exception.ResourceNotFoundException;
import com.synccore.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** The heart of SyncCore: validate stock -> save sale -> reduce stock, all in ONE transaction. */
@Service
public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderRepository orderRepository;

    public OrderService(CustomerRepository customerRepository, EmployeeRepository employeeRepository,
                        ProductRepository productRepository, InventoryRepository inventoryRepository,
                        OrderRepository orderRepository) {
        this.customerRepository = customerRepository;
        this.employeeRepository = employeeRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.orderRepository = orderRepository;
    }

    public List<Order> findAll() { return orderRepository.findAllByOrderByIdDesc(); }

    public Order findById(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order", id));
    }

    /**
     * @Transactional: if ANY line fails (e.g. insufficient stock on the 3rd item),
     * every stock change made so far is rolled back automatically.
     */
    @Transactional
    @CacheEvict(value = "dashboard", allEntries = true)
    public Order createOrder(OrderRequest req, String username) {
        Customer customer = customerRepository.findById(req.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", req.customerId()));

        Order order = new Order();
        order.setCustomer(customer);
        order.setEmployee(employeeRepository.findByUserUsername(username).orElse(null)); // who handled the sale
        order.setOrderDate(LocalDate.now());
        order.setStatus(OrderStatus.COMPLETED);

        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemRequest line : req.items()) {
            Product product = productRepository.findById(line.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", line.productId()));
            Inventory stock = inventoryRepository.findByProductId(product.getId())
                    .orElseThrow(() -> new BusinessException("No stock record for " + product.getName()));

            // ---- business rule: validate stock ----
            if (stock.getQuantity() < line.quantity()) {
                throw new BusinessException("Not enough stock for " + product.getName()
                        + " (available: " + stock.getQuantity() + ", requested: " + line.quantity() + ")");
            }
            stock.setQuantity(stock.getQuantity() - line.quantity()); // ---- stock reduced automatically

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(line.quantity());
            item.setUnitPrice(product.getUnitPrice()); // price frozen at time of sale
            order.addItem(item);

            total = total.add(product.getUnitPrice().multiply(BigDecimal.valueOf(line.quantity())));
        }
        order.setTotalAmount(total);

        Order saved = orderRepository.save(order);
        log.info("Order {} created by {} for customer {} total={}", saved.getId(), username, customer.getId(), total);
        return saved;
    }

    /** Cancelling gives the stock back. */
    @Transactional
    @CacheEvict(value = "dashboard", allEntries = true)
    public Order cancel(Long id) {
        Order order = findById(id);
        if (order.getStatus() == OrderStatus.CANCELLED) throw new BusinessException("Order is already cancelled");
        for (OrderItem item : order.getItems()) {
            inventoryRepository.findByProductId(item.getProduct().getId())
                    .ifPresent(inv -> inv.setQuantity(inv.getQuantity() + item.getQuantity()));
        }
        order.setStatus(OrderStatus.CANCELLED);
        log.info("Order {} cancelled, stock restored", id);
        return orderRepository.save(order);
    }
}
