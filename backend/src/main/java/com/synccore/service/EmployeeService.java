package com.synccore.service;

import com.synccore.dto.EmployeeRequest;
import com.synccore.entity.Employee;
import com.synccore.entity.User;
import com.synccore.exception.BusinessException;
import com.synccore.exception.ResourceNotFoundException;
import com.synccore.repository.EmployeeRepository;
import com.synccore.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(EmployeeRepository employeeRepository, UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Employee> findAll() { return employeeRepository.findAll(); }

    public Employee findById(Long id) {
        return employeeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Employee", id));
    }

    /** Creates the login account AND the employee profile in one transaction. */
    @Transactional
    public Employee create(EmployeeRequest req) {
        if (req.password() == null || req.password().isBlank()) throw new BusinessException("Password is required for a new employee");
        if (userRepository.existsByUsername(req.username())) throw new BusinessException("Username '" + req.username() + "' is already taken");

        User user = new User();
        user.setUsername(req.username());
        user.setPasswordHash(passwordEncoder.encode(req.password())); // BCrypt hash, never plain text
        user.setRole(req.role());
        userRepository.save(user);

        Employee e = new Employee();
        e.setUser(user);
        e.setFullName(req.fullName());
        e.setDesignation(req.designation());
        e.setHireDate(req.hireDate());
        return employeeRepository.save(e);
    }

    @Transactional
    public Employee update(Long id, EmployeeRequest req) {
        Employee e = findById(id);
        e.setFullName(req.fullName());
        e.setDesignation(req.designation());
        e.setHireDate(req.hireDate());
        User user = e.getUser();
        user.setRole(req.role());
        if (req.password() != null && !req.password().isBlank()) user.setPasswordHash(passwordEncoder.encode(req.password()));
        userRepository.save(user);
        return employeeRepository.save(e);
    }

    @Transactional
    public void delete(Long id, String currentUsername) {
        Employee e = findById(id);
        if (e.getUser().getUsername().equals(currentUsername)) throw new BusinessException("You cannot delete your own account");
        employeeRepository.delete(e);
        employeeRepository.flush(); // fails (409) if this employee processed orders
        userRepository.delete(e.getUser());
    }
}
