package com.smart.shopping.historyservice.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "order_history")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "order_history_items", joinColumns = @JoinColumn(name = "history_id"))
    private List<String> productNames = new ArrayList<>();
}
