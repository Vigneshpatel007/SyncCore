package com.synccore.service;

import com.synccore.entity.Customer;
import com.synccore.exception.BusinessException;
import com.synccore.exception.ResourceNotFoundException;
import com.synccore.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CustomerService {
    private final CustomerRepository repo;

    public CustomerService(CustomerRepository repo) { this.repo = repo; } // constructor-based dependency injection

    public List<Customer> findAll() { return repo.findAll(); }

    public Customer findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer", id));
    }

    public Customer create(Customer c) {
        c.setId(null);
        if (c.getEmail() != null && !c.getEmail().isBlank() && repo.existsByEmail(c.getEmail()))
            throw new BusinessException("A customer with this email already exists");
        if (c.getEmail() != null && c.getEmail().isBlank()) c.setEmail(null);
        return repo.save(c);
    }

    public Customer update(Long id, Customer in) {
        Customer c = findById(id);
        c.setName(in.getName());
        c.setEmail(in.getEmail() == null || in.getEmail().isBlank() ? null : in.getEmail());
        c.setPhone(in.getPhone());
        c.setAddress(in.getAddress());
        return repo.save(c);
    }

    public void delete(Long id) {
        repo.delete(findById(id));
        repo.flush(); // force the SQL now so a foreign-key error surfaces here
    }
}
