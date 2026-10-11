package com.synccore.service;

import com.synccore.entity.Supplier;
import com.synccore.exception.ResourceNotFoundException;
import com.synccore.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SupplierService {
    private final SupplierRepository repo;

    public SupplierService(SupplierRepository repo) { this.repo = repo; }

    public List<Supplier> findAll() { return repo.findAll(); }

    public Supplier findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
    }

    public Supplier create(Supplier s) { s.setId(null); return repo.save(s); }

    public Supplier update(Long id, Supplier in) {
        Supplier s = findById(id);
        s.setName(in.getName());
        s.setContactPerson(in.getContactPerson());
        s.setPhone(in.getPhone());
        s.setEmail(in.getEmail());
        return repo.save(s);
    }

    public void delete(Long id) {
        repo.delete(findById(id));
        repo.flush();
    }
}
