package com.loanengine.service;

import com.loanengine.dto.AuthDtos;
import com.loanengine.exception.ApiException;
import com.loanengine.model.OtpType;
import com.loanengine.model.Role;
import com.loanengine.model.User;
import com.loanengine.repository.UserRepository;
import com.loanengine.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(Role.USER)
                .emailVerified(false)
                .build();
        userRepository.save(user);

        otpService.generateAndSend(user.getEmail(), OtpType.EMAIL_VERIFICATION, "Verify your email to activate your account");

        return new AuthDtos.AuthResponse("Registration successful. Please verify your email with the OTP sent.");
    }

    @Transactional
    public AuthDtos.AuthResponse verifyEmail(AuthDtos.VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        if (user.isEmailVerified()) {
            return new AuthDtos.AuthResponse("Email already verified. You can login.");
        }

        otpService.verify(request.getEmail(), request.getOtp(), OtpType.EMAIL_VERIFICATION);
        user.setEmailVerified(true);
        userRepository.save(user);

        return new AuthDtos.AuthResponse("Email verified successfully. You can now login.");
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        if (request == null) {
            throw new ApiException("Request body is required", HttpStatus.BAD_REQUEST);
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ApiException("Email is required", HttpStatus.BAD_REQUEST);
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new ApiException("Password is required", HttpStatus.BAD_REQUEST);
        }

        String email = request.getEmail().trim().toLowerCase();
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new ApiException("Invalid email format", HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        if (!user.isEmailVerified()) {
            throw new ApiException("Please verify your email before logging in", HttpStatus.FORBIDDEN);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthDtos.AuthResponse(token, user.getEmail(), user.getFirstName(), user.getLastName(), user.getRole().name());
    }

    public AuthDtos.AuthResponse forgotPassword(AuthDtos.ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.findByEmail(email).isEmpty()) {
            // Generic message to avoid email enumeration
            return new AuthDtos.AuthResponse("If the email exists, an OTP has been sent");
        }
        otpService.generateAndSend(email, OtpType.PASSWORD_RESET, "Reset your password");
        return new AuthDtos.AuthResponse("OTP sent to your email for password reset");
    }

    public AuthDtos.AuthResponse verifyOtp(AuthDtos.VerifyOtpRequest request) {
        otpService.validateOnly(request.getEmail(), request.getOtp(), OtpType.PASSWORD_RESET);
        return new AuthDtos.AuthResponse("OTP verified. You may now reset your password.");
    }

    @Transactional
    public AuthDtos.AuthResponse resetPassword(AuthDtos.ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        otpService.verify(request.getEmail(), request.getOtp(), OtpType.PASSWORD_RESET);
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return new AuthDtos.AuthResponse("Password reset successful. Please login with your new password.");
    }
}
