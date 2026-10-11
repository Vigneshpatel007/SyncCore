package com.synccore.repository;

import com.synccore.dto.TopProduct;
import com.synccore.entity.OrderItem;
import com.synccore.entity.OrderStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    @Query("select new com.synccore.dto.TopProduct(oi.product.name, sum(oi.quantity), sum(oi.quantity * oi.unitPrice)) " +
           "from OrderItem oi where oi.order.status = :status " +
           "group by oi.product.name order by sum(oi.quantity) desc")
    List<TopProduct> topProducts(@Param("status") OrderStatus status, Pageable pageable);
}
