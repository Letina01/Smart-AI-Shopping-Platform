package com.smart.shopping.orderservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smart.shopping.orderservice.dto.AddCartItemRequest;
import com.smart.shopping.orderservice.dto.CreateOrderRequest;
import com.smart.shopping.orderservice.dto.OrderHistoryEvent;
import com.smart.shopping.orderservice.dto.OrderItemRequest;
import com.smart.shopping.orderservice.dto.PaymentRequest;
import com.smart.shopping.orderservice.entity.Cart;
import com.smart.shopping.orderservice.entity.CartItem;
import com.smart.shopping.orderservice.entity.Order;
import com.smart.shopping.orderservice.entity.OrderItem;
import com.smart.shopping.orderservice.entity.Payment;
import com.smart.shopping.orderservice.repository.CartRepository;
import com.smart.shopping.orderservice.repository.OrderRepository;
import com.smart.shopping.orderservice.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public OrderService(CartRepository cartRepository,
                        OrderRepository orderRepository,
                        PaymentRepository paymentRepository,
                        KafkaTemplate<String, String> kafkaTemplate,
                        ObjectMapper objectMapper) {
        this.cartRepository = cartRepository;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public Cart addToCart(AddCartItemRequest request) {
        Cart cart = cartRepository.findByUserId(request.getUserId())
                .orElseGet(() -> Cart.builder()
                        .userId(request.getUserId())
                        .updatedAt(LocalDateTime.now())
                        .build());

        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + Math.max(request.getQuantity(), 1));
        } else {
            CartItem item = CartItem.builder()
                    .productId(request.getProductId())
                    .name(request.getName())
                    .price(request.getPrice())
                    .quantity(Math.max(request.getQuantity(), 1))
                    .imageUrl(request.getImageUrl())
                    .platform(request.getPlatform())
                    .storeUrl(request.getStoreUrl())
                    .cart(cart)
                    .build();
            cart.getItems().add(item);
        }

        refreshCart(cart);
        Cart savedCart = cartRepository.save(cart);
        initializeCart(savedCart);
        return savedCart;
    }

    @Transactional(readOnly = true)
    public Cart getCart(String userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> Cart.builder()
                        .userId(userId)
                        .updatedAt(LocalDateTime.now())
                        .items(new ArrayList<>())
                        .totalPrice(0.0d)
                        .build());
        initializeCart(cart);
        return cart;
    }

    public Order checkoutCart(CreateOrderRequest request) {
        String userId = request.getUserId();
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));
        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        List<OrderItemRequest> items = cart.getItems().stream()
                .map(item -> {
                    OrderItemRequest itemRequest = new OrderItemRequest();
                    itemRequest.setProductId(item.getProductId());
                    itemRequest.setName(item.getName());
                    itemRequest.setPrice(item.getPrice());
                    itemRequest.setQuantity(item.getQuantity());
                    itemRequest.setImageUrl(item.getImageUrl());
                    itemRequest.setPlatform(item.getPlatform());
                    itemRequest.setStoreUrl(item.getStoreUrl());
                    return itemRequest;
                })
                .toList();

        Order order = createOrderInternal(request, items);
        cart.getItems().clear();
        refreshCart(cart);
        cartRepository.save(cart);
        initializeOrder(order);
        return order;
    }

    public Order buyNow(CreateOrderRequest request) {
        if (request.getProducts() == null || request.getProducts().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one product");
        }
        Order order = createOrderInternal(request, request.getProducts());
        initializeOrder(order);
        return order;
    }

    public Payment createPayment(PaymentRequest request) {
        return confirmPayment(request);
    }

    public Payment initiatePaymentRequest(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!"UPI".equalsIgnoreCase(request.getPaymentMethod())) {
            throw new IllegalArgumentException("Only UPI payment requests are supported");
        }
        if (request.getUpiId() == null || request.getUpiId().isBlank()) {
            throw new IllegalArgumentException("UPI ID is required");
        }

        Payment payment = order.getPayment();
        if (payment == null) {
            payment = Payment.builder().order(order).build();
        }
        payment.setPaymentMethod("UPI");
        payment.setPaymentStatus("REQUESTED");
        payment.setUpiId(request.getUpiId());
        if (payment.getTransactionReference() == null || payment.getTransactionReference().isBlank()) {
            payment.setTransactionReference(UUID.randomUUID().toString());
        }
        payment.setPaidAt(null);

        order.setPayment(payment);
        order.setStatus("PAYMENT_REQUESTED");

        paymentRepository.save(payment);
        orderRepository.save(order);
        return payment;
    }

    public Payment confirmPayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        Payment payment = order.getPayment();
        if (payment == null) {
            payment = Payment.builder().order(order).build();
        }
        String paymentMethod = request.getPaymentMethod() != null ? request.getPaymentMethod() : payment.getPaymentMethod();
        payment.setPaymentMethod(paymentMethod);
        if (request.getUpiId() != null && !request.getUpiId().isBlank()) {
            payment.setUpiId(request.getUpiId());
        }
        if (payment.getTransactionReference() == null || payment.getTransactionReference().isBlank()) {
            payment.setTransactionReference(UUID.randomUUID().toString());
        }
        payment.setPaymentStatus(resolvePaymentStatus(paymentMethod));
        payment.setPaidAt(LocalDateTime.now());
        order.setPayment(payment);
        order.setStatus("PAID");
        paymentRepository.save(payment);
        orderRepository.save(order);
        publishOrderEvent(order);
        return payment;
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersByUser(String userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }

    private Order createOrderInternal(CreateOrderRequest request, List<OrderItemRequest> items) {
        Order order = Order.builder()
                .userId(request.getUserId())
                .status("CREATED")
                .orderDate(LocalDateTime.now())
                .shippingAddress(request.getShippingAddress())
                .shippingCity(request.getShippingCity())
                .shippingState(request.getShippingState())
                .shippingZipCode(request.getShippingZipCode())
                .shippingCountry(request.getShippingCountry())
                .items(new ArrayList<>())
                .build();

        double total = 0.0d;
        for (OrderItemRequest itemRequest : items) {
            OrderItem orderItem = OrderItem.builder()
                    .productId(itemRequest.getProductId())
                    .name(itemRequest.getName())
                    .price(itemRequest.getPrice())
                    .quantity(Math.max(itemRequest.getQuantity(), 1))
                    .imageUrl(itemRequest.getImageUrl())
                    .platform(itemRequest.getPlatform())
                    .storeUrl(itemRequest.getStoreUrl())
                    .order(order)
                    .build();
            order.getItems().add(orderItem);
            total += orderItem.getPrice() * orderItem.getQuantity();
        }
        order.setTotalPrice(total);

        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(initialPaymentStatus(request.getPaymentMethod()))
                .transactionReference(UUID.randomUUID().toString())
                .paidAt("COD".equalsIgnoreCase(request.getPaymentMethod()) ? LocalDateTime.now() : null)
                .build();
        order.setPayment(payment);
        if ("SUCCESS".equals(payment.getPaymentStatus())) {
            order.setStatus("PAID");
        } else {
            order.setStatus("PAYMENT_PENDING");
        }

        Order savedOrder = orderRepository.save(order);
        if ("COD".equalsIgnoreCase(request.getPaymentMethod())) {
            publishOrderEvent(savedOrder);
        }
        return savedOrder;
    }

    private void refreshCart(Cart cart) {
        cart.setUpdatedAt(LocalDateTime.now());
        double totalPrice = cart.getItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
        cart.setTotalPrice(totalPrice);
        cart.getItems().forEach(item -> item.setCart(cart));
    }

    private String resolvePaymentStatus(String paymentMethod) {
        return "UPI".equalsIgnoreCase(paymentMethod) ? "SUCCESS" : "PENDING_COD";
    }

    private String initialPaymentStatus(String paymentMethod) {
        return "UPI".equalsIgnoreCase(paymentMethod) ? "INITIATED" : "PENDING_COD";
    }

    private void publishOrderEvent(Order order) {
        OrderHistoryEvent event = OrderHistoryEvent.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .orderDate(order.getOrderDate())
                .paymentMethod(order.getPayment() != null ? order.getPayment().getPaymentMethod() : null)
                .paymentStatus(order.getPayment() != null ? order.getPayment().getPaymentStatus() : null)
                .shippingAddress(order.getShippingAddress())
                .shippingCity(order.getShippingCity())
                .shippingState(order.getShippingState())
                .shippingZipCode(order.getShippingZipCode())
                .shippingCountry(order.getShippingCountry())
                .productNames(order.getItems().stream().map(OrderItem::getName).toList())
                .build();
        try {
            kafkaTemplate.send("order-topic", objectMapper.writeValueAsString(event));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize order event", e);
        } catch (Exception e) {
            log.warn("Failed to publish order event for order {}", order.getId(), e);
        }
    }

    private void initializeCart(Cart cart) {
        cart.getItems().size();
    }

    private void initializeOrder(Order order) {
        order.getItems().size();
        if (order.getPayment() != null) {
            order.getPayment().getId();
        }
    }
}
