package com.synccore.service;

import com.synccore.dto.OrderItemRequest;
import com.synccore.dto.OrderRequest;
import com.synccore.entity.*;
import com.synccore.exception.BusinessException;
import com.synccore.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Unit test: no Spring, no database. Repositories are replaced by Mockito mocks,
 * so we test ONLY the business rule inside OrderService.
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock CustomerRepository customerRepository;
    @Mock EmployeeRepository employeeRepository;
    @Mock ProductRepository productRepository;
    @Mock InventoryRepository inventoryRepository;
    @Mock OrderRepository orderRepository;
    @InjectMocks OrderService orderService;

    private Product pen() {
        Product p = new Product();
        p.setId(1L); p.setName("Pen"); p.setUnitPrice(new BigDecimal("10.00"));
        return p;
    }

    private Inventory stock(int qty) {
        Inventory inv = new Inventory();
        inv.setQuantity(qty);
        return inv;
    }

    @Test
    void createOrder_reducesStockAndCalculatesTotal() {
        Inventory inv = stock(10);
        when(customerRepository.findById(1L)).thenReturn(Optional.of(new Customer()));
        when(productRepository.findById(1L)).thenReturn(Optional.of(pen()));
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(inv));
        when(orderRepository.save(any(Order.class))).thenAnswer(call -> call.getArgument(0));

        Order order = orderService.createOrder(new OrderRequest(1L, List.of(new OrderItemRequest(1L, 3))), "admin");

        assertEquals(7, inv.getQuantity());                          // 10 - 3
        assertEquals(new BigDecimal("30.00"), order.getTotalAmount()); // 3 x 10.00
    }

    @Test
    void createOrder_withInsufficientStock_throwsBusinessException() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(new Customer()));
        when(productRepository.findById(1L)).thenReturn(Optional.of(pen()));
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(stock(2)));

        OrderRequest request = new OrderRequest(1L, List.of(new OrderItemRequest(1L, 5)));
        assertThrows(BusinessException.class, () -> orderService.createOrder(request, "admin"));
    }
}
