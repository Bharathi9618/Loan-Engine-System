package com.loanengine.controller;

import com.loanengine.model.OtpType;
import com.loanengine.service.OtpService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Optional OTP resend endpoint (auth flows use AuthController).
 */
@RestController
@RequestMapping("/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;

    @PostMapping("/resend")
    public ResponseEntity<Map<String, String>> resend(@RequestBody ResendRequest request) {
        OtpType type = OtpType.valueOf(request.getType());
        otpService.generateAndSend(request.getEmail(), type,
                type == OtpType.EMAIL_VERIFICATION ? "Email verification" : "Password reset");
        return ResponseEntity.ok(Map.of("message", "OTP resent successfully"));
    }

    @Data
    public static class ResendRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String type;
    }
}
