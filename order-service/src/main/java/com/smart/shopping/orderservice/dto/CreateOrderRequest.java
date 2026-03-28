package com.smart.shopping.orderservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {
    private String userId;
    private String paymentMethod;
    private List<OrderItemRequest> products;
    private String shippingAddress;
    private String shippingCity;
    private String shippingState;
    private String shippingZipCode;
    private String shippingCountry;
}
