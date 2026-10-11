package com.synccore.controller;

import com.synccore.dto.OrderRequest;
import com.synccore.entity.Order;
import com.synccore.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService service) { this.service = service; }

    @GetMapping
    public List<Order> all() { return service.findAll(); }

    @GetMapping("/{id}")
    public Order one(@PathVariable Long id) { return service.findById(id); }

    // `Authentication` is filled in by Spring Security from the JWT: auth.getName() = logged-in username
    @PostMapping
    public ResponseEntity<Order> create(@Valid @RequestBody OrderRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createOrder(request, auth.getName()));
    }

    @PutMapping("/{id}/cancel")
    public Order cancel(@PathVariable Long id) { return service.cancel(id); }
}
