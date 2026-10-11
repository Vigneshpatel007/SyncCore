package com.synccore.repository;

import com.synccore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/** Extending JpaRepository gives save/findAll/findById/delete... with zero code. */
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);   // Spring writes the SQL from the method name
    boolean existsByUsername(String username);
}
