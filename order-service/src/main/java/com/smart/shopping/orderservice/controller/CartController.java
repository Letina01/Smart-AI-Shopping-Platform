package com.smart.shopping.orderservice.controller;

import com.smart.shopping.orderservice.dto.AddCartItemRequest;
import com.smart.shopping.orderservice.entity.Cart;
import com.smart.shopping.orderservice.service.OrderService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cart")
public class CartController {

    private final OrderService service;

    public CartController(OrderService service) {
        this.service = service;
    }

    @PostMapping("/add")
    public Cart addToCart(@RequestBody AddCartItemRequest request) {
        return service.addToCart(request);
    }

    @GetMapping("/{userId}")
    public Cart getCart(@PathVariable String userId) {
        return service.getCart(userId);
    }
}
