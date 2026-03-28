package com.smart.shopping.orderservice.repository;

import com.smart.shopping.orderservice.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
