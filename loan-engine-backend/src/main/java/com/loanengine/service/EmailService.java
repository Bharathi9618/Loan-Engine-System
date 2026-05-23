package com.loanengine.service;

import com.loanengine.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.dev-log-only:true}")
    private boolean devLogOnly;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public void sendOtpEmail(String to, String otp, String purpose) {
        String subject = "Loan Engine - " + purpose;
        String html = buildOtpHtml(to, otp, purpose);

        if (devLogOnly) {
            log.info("========== EMAIL (DEV MODE) ==========");
            log.info("To: {}", to);
            log.info("Subject: {}", subject);
            log.info("OTP: {}", otp);
            log.info("======================================");
            return;
        }

        if (mailUsername == null || mailUsername.isBlank()) {
            log.error("Email sending requested but SMTP email username is not configured in environment variables or application.yml");
            throw new ApiException("Email sending is currently misconfigured. Please check SMTP credentials.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("OTP email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to build email message for {}", to, e);
            throw new ApiException("Failed to build email message: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            log.error("Failed to send SMTP email to {}", to, e);
            throw new ApiException("Failed to send email. Check SMTP configuration, network firewall, or port settings.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String buildOtpHtml(String email, String otp, String purpose) {
        return """
                <!DOCTYPE html>
                <html>
                <body style="font-family:Arial,sans-serif;background:#f4f6f8;padding:20px;">
                <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
                <h2 style="color:#2563eb;">Loan Eligibility Engine</h2>
                <p>Hello,</p>
                <p>%s</p>
                <div style="background:#eff6ff;border:2px dashed #2563eb;border-radius:8px;padding:20px;text-align:center;margin:24px 0;">
                <span style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#1e40af;">%s</span>
                </div>
                <p>This OTP is valid for <strong>5 minutes</strong> and can only be used once.</p>
                <p style="color:#6b7280;font-size:12px;">Sent to %s. If you did not request this, ignore this email.</p>
                </div>
                </body>
                </html>
                """.formatted(purpose, otp, email);
    }
}
