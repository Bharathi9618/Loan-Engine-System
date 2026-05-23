package com.loanengine.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public final class AuthDtos {

    private AuthDtos() {}

    @Data
    public static class RegisterRequest {
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 8, max = 100)
        private String password;
        @NotBlank
        private String firstName;
        @NotBlank
        private String lastName;
    }

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    public static class VerifyEmailRequest {
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6, max = 6)
        private String otp;
    }

    @Data
    public static class ForgotPasswordRequest {
        @NotBlank @Email
        private String email;
    }

    @Data
    public static class VerifyOtpRequest {
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6, max = 6)
        private String otp;
    }

    @Data
    public static class ResetPasswordRequest {
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6, max = 6)
        private String otp;
        @NotBlank @Size(min = 8, max = 100)
        private String newPassword;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String email;
        private String firstName;
        private String lastName;
        private String role;
        private String message;

        public AuthResponse(String token, String email, String firstName, String lastName, String role) {
            this.token = token;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.role = role;
        }

        public AuthResponse(String message) {
            this.message = message;
        }
    }
}
