package com.volleyball.tournament.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("etobicokevolleyballclub13@gmail.com");
        message.setTo(toEmail);
        message.setSubject("Your password reset code — Etobicoke Volleyball Club");
        message.setText(
                "Hello,\n\n" +
                "You requested a password reset for your Etobicoke Volleyball Club account.\n\n" +
                "Your verification code is: " + code + "\n\n" +
                "This code expires in 15 minutes. If you did not request this, you can safely ignore this email.\n\n" +
                "— Etobicoke Volleyball Club"
        );
        mailSender.send(message);
    }
}