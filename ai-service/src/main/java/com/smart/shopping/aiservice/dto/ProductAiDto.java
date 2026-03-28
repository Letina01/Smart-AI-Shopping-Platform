package com.smart.shopping.aiservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductAiDto {
    private String id;
    private String name;
    private double price;
    private double rating;
    private String platform;
    private String storeUrl;
    private String imageUrl;
    private String currency;
}
