package com.volleyball.tournament.auth.service;

import com.volleyball.tournament.common.exception.ApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class EmailService {

    private static final String FROM_EMAIL = "etobicokevolleyballclub13@gmail.com";
    private static final String FROM_NAME  = "Nilkanth Volleyball Club";

    private final RestClient restClient;

    public EmailService(@Value("${app.brevo.api-key}") String apiKey) {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.brevo.com/v3")
                .defaultHeader("api-key", apiKey)
                .defaultHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public void sendPasswordResetCode(String toEmail, String code) {
        Map<String, Object> body = Map.of(
                "sender",      Map.of("email", FROM_EMAIL, "name", FROM_NAME),
                "to",          List.of(Map.of("email", toEmail)),
                "subject",     "Your password reset code — Nilkanth Volleyball Club",
                "textContent", "Hello,\n\n" +
                               "You requested a password reset for your Nilkanth Volleyball Club account.\n\n" +
                               "Your verification code is: " + code + "\n\n" +
                               "This code expires in 15 minutes. If you did not request this, you can safely ignore this email.\n\n" +
                               "— Nilkanth Volleyball Club"
        );
        try {
            restClient.post()
                    .uri("/smtp/email")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException ex) {
            log.error("Failed to send password reset email to {} via Brevo API: {}", toEmail, ex.getMessage(), ex);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not send the reset email. Please try again later.");
        }
    }
}