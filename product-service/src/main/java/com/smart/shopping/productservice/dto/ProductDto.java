package com.smart.shopping.productservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductDto implements Serializable {
    private String id;
    private String name;
    private double price;
    private double rating;
    private String platform;
    private String storeUrl;
    private String imageUrl;
    private String currency;
    private double originalPriceUsd;
    private String description;
    private String category;
}
