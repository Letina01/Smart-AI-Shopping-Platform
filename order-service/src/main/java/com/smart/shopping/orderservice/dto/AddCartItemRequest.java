package com.smart.shopping.orderservice.dto;

import lombok.Data;

@Data
public class AddCartItemRequest {
    private String userId;
    private String productId;
    private String name;
    private double price;
    private int quantity;
    private String imageUrl;
    private String platform;
    private String storeUrl;
}
