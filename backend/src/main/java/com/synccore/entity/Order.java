package com.synccore.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** A sale. Table is called "orders" because ORDER is a reserved SQL word. */
@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne // the employee who processed it (null if an admin without an employee profile did it)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    private LocalDate orderDate;

    @Column(precision = 14, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.COMPLETED;

    // cascade ALL: saving an Order automatically saves its items too
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItem> items = new ArrayList<>();

    /** Keeps both sides of the relationship in sync. */
    public void addItem(OrderItem item) {
        item.setOrder(this);
        items.add(item);
    }
}
