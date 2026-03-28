package com.smart.shopping.productservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class DummyJsonProductResponse {
    private List<DummyJsonProduct> products;

    @Data
    public static class DummyJsonProduct {
        private Long id;
        private String title;
        private String description;
        private String category;
        private Double price;
        private Double rating;
        private String thumbnail;
    }
}
