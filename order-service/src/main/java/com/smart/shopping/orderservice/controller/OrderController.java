package com.smart.shopping.orderservice.controller;

import com.smart.shopping.orderservice.dto.CreateOrderRequest;
import com.smart.shopping.orderservice.entity.Order;
import com.smart.shopping.orderservice.service.OrderService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping
    public Order placeOrder(@RequestBody CreateOrderRequest request) {
        return service.buyNow(request);
    }

    @PostMapping("/buy-now")
    public Order buyNow(@RequestBody CreateOrderRequest request) {
        return service.buyNow(request);
    }

    @PostMapping("/checkout/{userId}")
    public Order checkoutCart(@PathVariable String userId, @RequestBody CreateOrderRequest request) {
        request.setUserId(userId);
        return service.checkoutCart(request);
    }

    @GetMapping("/history")
    public List<Order> getOrders(@RequestParam String userId) {
        return service.getOrdersByUser(userId);
    }
}
