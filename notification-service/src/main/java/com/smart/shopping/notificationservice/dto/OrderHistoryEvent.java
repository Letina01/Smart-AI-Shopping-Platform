package com.smart.shopping.notificationservice.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
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
