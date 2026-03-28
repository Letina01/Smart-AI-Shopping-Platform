package com.smart.shopping.orderservice.controller;

import com.smart.shopping.orderservice.exception.OrderExceptionHandler;
import com.smart.shopping.orderservice.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PaymentControllerTest {

    private MockMvc mockMvc;
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = mock(OrderService.class);
        PaymentController controller = new PaymentController(orderService);

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new OrderExceptionHandler())
                .build();
    }

    @Test
    void shouldReturnBadRequestWhenUpiIdMissing() throws Exception {
        doThrow(new IllegalArgumentException("UPI ID is required"))
                .when(orderService)
                .initiatePaymentRequest(any());

        mockMvc.perform(post("/payment/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "orderId": 10,
                                  "paymentMethod": "UPI",
                                  "upiId": ""
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("UPI ID is required"));
    }
}
