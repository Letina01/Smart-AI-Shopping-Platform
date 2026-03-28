package com.smart.shopping.aiservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiRecommendationResponse {
    private ProductAiDto bestProduct;
    private ProductAiDto cheapestProduct;
    private ProductAiDto topRatedProduct;
    private String recommendation;
}
