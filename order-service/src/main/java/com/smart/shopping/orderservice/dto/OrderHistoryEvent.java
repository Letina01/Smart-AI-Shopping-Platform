package com.smart.shopping.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderHistoryEvent {
    private Long orderId;
    private String userId;
    private double totalPrice;
    private String status;
    private LocalDateTime orderDate;
    private String paymentMethod;
    private String paymentStatus;
    private String shippingAddress;
    private String shippingCity;
    private String shippingState;
    private String shippingZipCode;
    private String shippingCountry;
    private List<String> productNames;
}
