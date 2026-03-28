package com.smart.shopping.orderservice.controller;

import com.smart.shopping.orderservice.dto.PaymentRequest;
import com.smart.shopping.orderservice.entity.Payment;
import com.smart.shopping.orderservice.service.OrderService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    private final OrderService service;

    public PaymentController(OrderService service) {
        this.service = service;
    }

    @PostMapping("/request")
    public Payment initiatePaymentRequest(@RequestBody PaymentRequest request) {
        return service.initiatePaymentRequest(request);
    }

    @PostMapping
    public Payment createPayment(@RequestBody PaymentRequest request) {
        return service.createPayment(request);
    }

    @PostMapping("/confirm")
    public Payment confirmPayment(@RequestBody PaymentRequest request) {
        return service.confirmPayment(request);
    }
}
