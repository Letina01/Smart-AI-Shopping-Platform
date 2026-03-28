package com.smart.shopping.aiservice.service;

import com.smart.shopping.aiservice.dto.AiRecommendationResponse;
import com.smart.shopping.aiservice.dto.ProductAiDto;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class AiService {

    public AiRecommendationResponse analyzeProducts(List<ProductAiDto> products, String criteria) {
        if (products == null || products.isEmpty()) {
            return AiRecommendationResponse.builder()
                    .recommendation("No products available to analyze.")
                    .build();
        }

        ProductAiDto cheapest = products.stream()
                .min((left, right) -> Double.compare(left.getPrice(), right.getPrice()))
                .orElse(products.get(0));
        ProductAiDto topRated = products.stream()
                .max((left, right) -> Double.compare(left.getRating(), right.getRating()))
                .orElse(products.get(0));
        ProductAiDto bestValue = products.stream()
                .max((left, right) -> Double.compare(score(left), score(right)))
                .orElse(products.get(0));

        return AiRecommendationResponse.builder()
                .bestProduct(bestValue)
                .cheapestProduct(cheapest)
                .topRatedProduct(topRated)
                .recommendation(buildRecommendation(criteria, bestValue, cheapest, topRated))
                .build();
    }

    private double score(ProductAiDto product) {
        double normalizedRating = product.getRating() / 5.0d;
        double affordability = 1.0d / Math.max(product.getPrice(), 1.0d);
        return (normalizedRating * 0.7d) + (affordability * 250.0d * 0.3d);
    }

    private String buildRecommendation(String criteria, ProductAiDto bestValue, ProductAiDto cheapest, ProductAiDto topRated) {
        String normalizedCriteria = criteria == null ? "" : criteria.toLowerCase(Locale.ROOT);
        if (normalizedCriteria.contains("cheap") || normalizedCriteria.contains("price")) {
            return String.format(
                    "%s is the cheapest option at Rs %.2f. %s offers the strongest overall value, while %s has the highest rating at %.1f.",
                    cheapest.getName(), cheapest.getPrice(), bestValue.getName(), topRated.getName(), topRated.getRating()
            );
        }
        if (normalizedCriteria.contains("rating") || normalizedCriteria.contains("top")) {
            return String.format(
                    "%s is the top-rated product at %.1f/5. %s remains the best value pick because it balances price and rating, and %s is the cheapest fallback.",
                    topRated.getName(), topRated.getRating(), bestValue.getName(), cheapest.getName()
            );
        }
        return String.format(
                "%s is the best overall value pick. It balances a strong %.1f rating with a price of Rs %.2f. If budget matters most, choose %s. If ratings matter most, choose %s.",
                bestValue.getName(), bestValue.getRating(), bestValue.getPrice(), cheapest.getName(), topRated.getName()
        );
    }
}
