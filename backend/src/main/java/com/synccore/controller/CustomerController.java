package com.synccore.controller;

import com.synccore.entity.Customer;
import com.synccore.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CustomerService service;

    public CustomerController(CustomerService service) { this.service = service; }

    @GetMapping                                   // READ all
    public List<Customer> all() { return service.findAll(); }

    @GetMapping("/{id}")                          // READ one
    public Customer one(@PathVariable Long id) { return service.findById(id); }

    @PostMapping                                  // CREATE
    public ResponseEntity<Customer> create(@Valid @RequestBody Customer customer) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(customer));
    }

    @PutMapping("/{id}")                          // UPDATE
    public Customer update(@PathVariable Long id, @Valid @RequestBody Customer customer) {
        return service.update(id, customer);
    }

    @DeleteMapping("/{id}")                       // DELETE (admin only)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
