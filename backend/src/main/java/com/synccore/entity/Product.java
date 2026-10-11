package com.synccore.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

/** Catalog item. Many products belong to one supplier (@ManyToOne). */
@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(nullable = false)
    private String name;

    private String category;

    @Column(nullable = false, unique = true)
    private String sku; // unique product code

    // BigDecimal (never double) for money so rounding errors cannot happen
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;
}
