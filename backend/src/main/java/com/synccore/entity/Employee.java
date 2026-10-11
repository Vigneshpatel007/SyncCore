package com.synccore.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

/** Employee profile. One-to-one with a login account (User). */
@Entity
@Table(name = "employees")
@Getter @Setter @NoArgsConstructor
public class Employee {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", unique = true) // FK column -> users.id
    private User user;

    @Column(nullable = false)
    private String fullName;

    private String designation;
    private LocalDate hireDate;
}
