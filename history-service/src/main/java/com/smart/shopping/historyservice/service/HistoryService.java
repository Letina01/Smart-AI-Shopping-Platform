package com.smart.shopping.historyservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smart.shopping.historyservice.dto.OrderHistoryEvent;
import com.smart.shopping.historyservice.entity.OrderHistory;
import com.smart.shopping.historyservice.entity.SearchHistory;
import com.smart.shopping.historyservice.repository.OrderHistoryRepository;
import com.smart.shopping.historyservice.repository.SearchHistoryRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class HistoryService {

    private final SearchHistoryRepository searchHistoryRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final ObjectMapper objectMapper;

    public HistoryService(SearchHistoryRepository searchHistoryRepository,
                          OrderHistoryRepository orderHistoryRepository,
                          ObjectMapper objectMapper) {
        this.searchHistoryRepository = searchHistoryRepository;
        this.orderHistoryRepository = orderHistoryRepository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "user-search-topic", groupId = "history-group")
    public void consumeSearchEvent(String message) {
        log.info("Consumed search event: {}", message);
        String[] parts = message.split(":");
        if (parts.length >= 2) {
            SearchHistory history = SearchHistory.builder()
                    .userEmail(parts[0])
                    .searchQuery(parts[1])
                    .timestamp(LocalDateTime.now())
                    .build();
            searchHistoryRepository.save(history);
        }
    }

    @KafkaListener(topics = "order-topic", groupId = "history-group")
    public void consumeOrderEvent(String message) {
        try {
            OrderHistoryEvent event = objectMapper.readValue(message, OrderHistoryEvent.class);
            OrderHistory history = orderHistoryRepository.findByOrderId(event.getOrderId())
                    .orElseGet(() -> OrderHistory.builder().orderId(event.getOrderId()).build());
            history.setUserId(event.getUserId());
            history.setTotalPrice(event.getTotalPrice());
            history.setStatus(event.getStatus());
            history.setOrderDate(event.getOrderDate());
            history.setPaymentMethod(event.getPaymentMethod());
            history.setPaymentStatus(event.getPaymentStatus());
            history.setShippingAddress(event.getShippingAddress());
            history.setShippingCity(event.getShippingCity());
            history.setShippingState(event.getShippingState());
            history.setShippingZipCode(event.getShippingZipCode());
            history.setShippingCountry(event.getShippingCountry());
            history.setProductNames(event.getProductNames());
            orderHistoryRepository.save(history);
        } catch (Exception ex) {
            log.warn("Failed to process order history event: {}", ex.getMessage());
        }
    }

    public List<SearchHistory> getSearchHistory(String email) {
        return searchHistoryRepository.findByUserEmail(email);
    }

    public List<OrderHistory> getOrderHistory(String userId) {
        return orderHistoryRepository.findByUserIdOrderByOrderDateDesc(userId);
    }
}
