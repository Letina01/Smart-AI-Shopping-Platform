package com.smart.shopping.orderservice.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private Long orderId;
    private String paymentMethod;
    private String upiId;
}
