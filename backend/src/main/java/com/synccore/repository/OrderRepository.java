package com.synccore.repository;

import com.synccore.dto.SalesPoint;
import com.synccore.entity.Order;
import com.synccore.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByOrderByIdDesc();

    @Query("select sum(o.totalAmount) from Order o where o.status = :status")
    BigDecimal sumRevenue(@Param("status") OrderStatus status);

    // Aggregation is done by the database and mapped straight into a DTO
    @Query("select new com.synccore.dto.SalesPoint(o.orderDate, sum(o.totalAmount), count(o)) " +
           "from Order o where o.status = :status group by o.orderDate order by o.orderDate")
    List<SalesPoint> salesByDate(@Param("status") OrderStatus status);
}
