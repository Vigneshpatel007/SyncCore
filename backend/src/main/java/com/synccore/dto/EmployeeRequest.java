package com.synccore.dto;

import com.synccore.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record EmployeeRequest(
        @NotBlank(message = "Full name is required") String fullName,
        String designation,
        LocalDate hireDate,
        @NotBlank(message = "Username is required") String username,
        @Size(min = 6, message = "Password must be at least 6 characters") String password,
        @NotNull(message = "Role is required") Role role) { }
