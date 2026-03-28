package com.smart.shopping.orderservice.repository;

import com.smart.shopping.orderservice.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByOrderDateDesc(String userId);
}
