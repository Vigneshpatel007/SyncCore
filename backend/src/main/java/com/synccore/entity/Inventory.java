package com.synccore.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/** Stock record: exactly one per product (one-to-one). */
@Entity
@Table(name = "inventory")
@Getter @Setter @NoArgsConstructor
public class Inventory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "product_id", unique = true)
    private Product product;

    @Column(nullable = false)
    private Integer quantity = 0;      // current stock on hand

    @Column(nullable = false)
    private Integer reorderLevel = 10; // low-stock threshold

    private LocalDateTime lastUpdated;

    // JPA lifecycle hook: runs automatically before every INSERT / UPDATE
    @PrePersist @PreUpdate
    void touch() { this.lastUpdated = LocalDateTime.now(); }
}
