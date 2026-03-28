package com.smart.shopping.historyservice.repository;

import com.smart.shopping.historyservice.entity.OrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Long> {
    List<OrderHistory> findByUserIdOrderByOrderDateDesc(String userId);
    Optional<OrderHistory> findByOrderId(Long orderId);
}
