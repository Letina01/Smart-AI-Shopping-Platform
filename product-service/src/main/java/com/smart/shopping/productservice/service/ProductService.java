package com.smart.shopping.productservice.service;

import com.smart.shopping.productservice.dto.ProductDto;
import com.smart.shopping.productservice.dto.DummyJsonProductResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ProductService {

    private static final double USD_TO_INR = 83.12d;

    private final RestClient restClient;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    public ProductService(@Value("${external.product-api.base-url:https://dummyjson.com}") String productApiBaseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(productApiBaseUrl)
                .build();
    }

    @Cacheable(value = "products", key = "#query")
    public List<ProductDto> searchProducts(String query, String userEmail) {
        log.info("Searching products for: {}", query);

        if (userEmail != null) {
            kafkaTemplate.send("user-search-topic", userEmail + ":" + query);
        }

        List<DummyJsonProductResponse.DummyJsonProduct> products = fetchFromSearchEndpoint(query);
        if (products.isEmpty()) {
            products = findRelevantProductsFromCatalog(query);
        }

        return products.stream()
                .map(this::toProductDto)
                .toList();
    }

    private List<DummyJsonProductResponse.DummyJsonProduct> fetchFromSearchEndpoint(String query) {
        try {
            DummyJsonProductResponse response = restClient.get()
                    .uri("/products/search?q=" + UriUtils.encodeQueryParam(query, StandardCharsets.UTF_8))
                    .retrieve()
                    .body(DummyJsonProductResponse.class);
            return response != null && response.getProducts() != null ? response.getProducts() : List.of();
        } catch (Exception ex) {
            log.warn("DummyJSON search request failed for query '{}': {}", query, ex.getMessage());
            return List.of();
        }
    }

    private List<DummyJsonProductResponse.DummyJsonProduct> findRelevantProductsFromCatalog(String query) {
        try {
            DummyJsonProductResponse response = restClient.get()
                    .uri("/products?limit=194")
                    .retrieve()
                    .body(DummyJsonProductResponse.class);

            if (response == null || response.getProducts() == null) {
                return List.of();
            }

            Set<String> searchTerms = buildSearchTerms(query);
            return response.getProducts().stream()
                    .filter(product -> relevanceScore(product, searchTerms) > 0)
                    .sorted(Comparator.comparingInt((DummyJsonProductResponse.DummyJsonProduct p) -> relevanceScore(p, searchTerms)).reversed())
                    .limit(12)
                    .toList();
        } catch (Exception ex) {
            log.warn("DummyJSON catalog request failed for query '{}': {}", query, ex.getMessage());
            return List.of();
        }
    }

    private Set<String> buildSearchTerms(String query) {
        String normalized = query.toLowerCase(Locale.ROOT).trim();
        Set<String> terms = new LinkedHashSet<>();
        terms.add(normalized);
        for (String token : normalized.split("\\s+")) {
            if (!token.isBlank()) {
                terms.add(token);
            }
        }

        Map<String, List<String>> synonyms = Map.of(
                "basmati rice", List.of("rice", "groceries"),
                "rice", List.of("groceries"),
                "laptop", List.of("laptops", "computer"),
                "phone", List.of("smartphone", "mobile"),
                "mobile", List.of("smartphone", "phone")
        );

        synonyms.forEach((key, values) -> {
            if (normalized.contains(key)) {
                terms.addAll(values);
            }
        });
        return terms;
    }

    private int relevanceScore(DummyJsonProductResponse.DummyJsonProduct product, Set<String> searchTerms) {
        String haystack = String.join(" ",
                Objects.toString(product.getTitle(), ""),
                Objects.toString(product.getDescription(), ""),
                Objects.toString(product.getCategory(), "")
        ).toLowerCase(Locale.ROOT);

        int score = 0;
        for (String term : searchTerms) {
            if (haystack.contains(term)) {
                score += term.contains(" ") ? 5 : 2;
            }
        }
        return score;
    }

    private ProductDto toProductDto(DummyJsonProductResponse.DummyJsonProduct product) {
        double usdPrice = product.getPrice() != null ? product.getPrice() : 0.0d;
        double inrPrice = BigDecimal.valueOf(usdPrice * USD_TO_INR)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();

        return ProductDto.builder()
                .id(String.valueOf(product.getId()))
                .name(product.getTitle())
                .description(product.getDescription())
                .category(product.getCategory())
                .price(inrPrice)
                .originalPriceUsd(usdPrice)
                .currency("INR")
                .rating(product.getRating() != null ? product.getRating() : 0.0d)
                .platform("DummyJSON")
                .storeUrl("https://dummyjson.com/products/" + product.getId())
                .imageUrl(product.getThumbnail())
                .build();
    }
}
