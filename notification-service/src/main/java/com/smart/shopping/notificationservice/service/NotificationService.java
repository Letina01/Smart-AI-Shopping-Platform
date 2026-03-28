package com.smart.shopping.notificationservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smart.shopping.notificationservice.dto.OrderHistoryEvent;
import com.smart.shopping.notificationservice.dto.UserProfileDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
@Slf4j
public class NotificationService {

    private final ObjectMapper objectMapper;
    private final JavaMailSender javaMailSender;
    private final RestClient restClient;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.user-service.base-url}")
    private String userServiceBaseUrl;

    @Value("${app.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${app.sms.provider-url:}")
    private String smsProviderUrl;

    @Value("${app.sms.account-id:}")
    private String smsAccountId;

    @Value("${app.sms.auth-token:}")
    private String smsAuthToken;

    @Value("${app.sms.from-number:}")
    private String smsFromNumber;

    public NotificationService(ObjectMapper objectMapper,
                               JavaMailSender javaMailSender,
                               RestClient.Builder restClientBuilder) {
        this.objectMapper = objectMapper;
        this.javaMailSender = javaMailSender;
        this.restClient = restClientBuilder.build();
    }

    @KafkaListener(topics = "order-topic", groupId = "notification-group")
    public void consumeOrderEvent(String message) {
        log.info("Notification: Order event received -> {}", message);
        try {
            OrderHistoryEvent event = objectMapper.readValue(message, OrderHistoryEvent.class);
            UserProfileDto userProfile = fetchUserProfile(event.getUserId());
            sendEmail(event, userProfile);
            sendSms(event, userProfile);
        } catch (Exception ex) {
            log.warn("Notification fallback. Could not process order event: {}", ex.getMessage(), ex);
        }
    }

    private UserProfileDto fetchUserProfile(String email) {
        try {
            return restClient.get()
                    .uri(userServiceBaseUrl + "/users/profile?email={email}", email)
                    .retrieve()
                    .body(UserProfileDto.class);
        } catch (RestClientException ex) {
            log.warn("Unable to fetch user profile for {}: {}", email, ex.getMessage());
            return null;
        }
    }

    private void sendEmail(OrderHistoryEvent event, UserProfileDto userProfile) {
        String senderEmail = StringUtils.hasText(fromEmail) ? fromEmail : mailUsername;
        if (!StringUtils.hasText(senderEmail)) {
            log.warn("Email skipped for order {} because sender email is not configured", event.getOrderId());
            return;
        }
        String recipientEmail = userProfile != null && StringUtils.hasText(userProfile.getEmail())
                ? userProfile.getEmail()
                : event.getUserId();
        if (!StringUtils.hasText(recipientEmail) || !recipientEmail.contains("@")) {
            log.warn("Email skipped for order {} because recipient email is invalid: {}", event.getOrderId(), recipientEmail);
            return;
        }

        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(senderEmail);
            mail.setTo(recipientEmail);
            mail.setSubject("Order Confirmation #" + event.getOrderId());
            mail.setText(buildEmailBody(event));
            javaMailSender.send(mail);
            log.info("Order confirmation email sent to {}", recipientEmail);
        } catch (Exception ex) {
            log.warn("Unable to send order confirmation email to {}: {}", recipientEmail, ex.getMessage(), ex);
        }
    }

    private void sendSms(OrderHistoryEvent event, UserProfileDto userProfile) {
        if (!smsEnabled) {
            return;
        }
        String phoneNumber = userProfile != null ? userProfile.getPhone() : null;
        if (!StringUtils.hasText(phoneNumber)) {
            log.warn("SMS skipped for order {} because no phone number is available", event.getOrderId());
            return;
        }
        if (!StringUtils.hasText(smsProviderUrl)
                || !StringUtils.hasText(smsAccountId)
                || !StringUtils.hasText(smsAuthToken)
                || !StringUtils.hasText(smsFromNumber)) {
            log.warn("SMS skipped for order {} because SMS provider configuration is incomplete", event.getOrderId());
            return;
        }

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("To", phoneNumber);
        formData.add("From", smsFromNumber);
        formData.add("Body", buildSmsBody(event));

        try {
            restClient.post()
                    .uri(smsProviderUrl, smsAccountId)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .header(HttpHeaders.AUTHORIZATION, basicAuthHeader(smsAccountId, smsAuthToken))
                    .body(formData)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Order confirmation SMS sent to {}", phoneNumber);
        } catch (RestClientException ex) {
            log.warn("Unable to send order confirmation SMS to {}: {}", phoneNumber, ex.getMessage(), ex);
        }
    }

    private String buildEmailBody(OrderHistoryEvent event) {
        return """
                Your order has been received.

                Order ID: %s
                Status: %s
                Payment: %s (%s)
                Total: Rs %.2f
                Products: %s
                Delivery Address: %s, %s, %s - %s, %s
                """.formatted(
                event.getOrderId(),
                event.getStatus(),
                event.getPaymentMethod(),
                event.getPaymentStatus(),
                event.getTotalPrice(),
                String.join(", ", event.getProductNames()),
                event.getShippingAddress(),
                event.getShippingCity(),
                event.getShippingState(),
                event.getShippingZipCode(),
                event.getShippingCountry()
        );
    }

    private String buildSmsBody(OrderHistoryEvent event) {
        return "Order #" + event.getOrderId()
                + " confirmed. Status: " + event.getStatus()
                + ", Total: Rs " + String.format("%.2f", event.getTotalPrice())
                + ", Payment: " + event.getPaymentMethod() + ".";
    }

    private String basicAuthHeader(String username, String password) {
        String credentials = username + ":" + password;
        return "Basic " + java.util.Base64.getEncoder().encodeToString(credentials.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
}
