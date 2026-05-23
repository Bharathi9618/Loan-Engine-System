package com.loanengine.service;

import com.loanengine.exception.ApiException;
import com.loanengine.model.OtpToken;
import com.loanengine.model.OtpType;
import com.loanengine.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Generates 6-digit OTPs, stores BCrypt hash, enforces 5-minute expiry and one-time use.
 */
@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.otp.expiry-minutes:5}")
    private int expiryMinutes;

    @Value("${app.otp.length:6}")
    private int otpLength;

    @Transactional
    public void generateAndSend(String email, OtpType type, String emailPurpose) {
        String otp = generateOtp();
        String hash = passwordEncoder.encode(otp);

        OtpToken token = OtpToken.builder()
                .email(email.toLowerCase().trim())
                .otpHash(hash)
                .type(type)
                .expiresAt(LocalDateTime.now().plusMinutes(expiryMinutes))
                .used(false)
                .build();
        otpRepository.save(token);
        emailService.sendOtpEmail(email, otp, emailPurpose);
    }

    /** Validates OTP without consuming it (for intermediate steps). */
    public void validateOnly(String email, String otp, OtpType type) {
        findValidToken(email, otp, type);
    }

    @Transactional
    public void verify(String email, String otp, OtpType type) {
        OtpToken token = findValidToken(email, otp, type);
        token.setUsed(true);
        otpRepository.save(token);
    }

    private OtpToken findValidToken(String email, String otp, OtpType type) {
        String normalizedEmail = email.toLowerCase().trim();
        OtpToken token = otpRepository
                .findTopByEmailAndTypeAndUsedFalseOrderByCreatedAtDesc(normalizedEmail, type)
                .orElseThrow(() -> new ApiException("No valid OTP found. Please request a new one.", HttpStatus.BAD_REQUEST));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException("OTP has expired. Please request a new one.", HttpStatus.BAD_REQUEST);
        }

        if (!passwordEncoder.matches(otp, token.getOtpHash())) {
            throw new ApiException("Invalid OTP", HttpStatus.BAD_REQUEST);
        }
        return token;
    }

    @Transactional
    public void invalidateActiveOtps(String email, OtpType type) {
        List<OtpToken> tokens = otpRepository.findByEmailAndTypeAndUsedFalseOrderByCreatedAtDesc(
                email.toLowerCase().trim(), type);
        tokens.forEach(t -> {
            t.setUsed(true);
            otpRepository.save(t);
        });
    }

    private String generateOtp() {
        int bound = (int) Math.pow(10, otpLength);
        int min = bound / 10;
        int code = secureRandom.nextInt(bound - min) + min;
        return String.format("%0" + otpLength + "d", code);
    }
}
