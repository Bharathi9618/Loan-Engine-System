package com.loanengine.config;

import com.loanengine.model.Role;
import com.loanengine.model.User;
import com.loanengine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds demo accounts with correctly hashed passwords.
 * Admin: admin@loanengine.com / Admin@123
 * User:  user@loanengine.com / User@123
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUser("admin@loanengine.com", "Admin", "User", "Admin@123", Role.ADMIN);
        seedUser("user@loanengine.com", "Demo", "User", "User@123", Role.USER);
    }

    private void seedUser(String email, String first, String last, String rawPassword, Role role) {
        userRepository.findByEmail(email).ifPresentOrElse(
                u -> log.info("Demo account exists: {}", email),
                () -> {
                    User user = User.builder()
                            .email(email)
                            .password(passwordEncoder.encode(rawPassword))
                            .firstName(first)
                            .lastName(last)
                            .role(role)
                            .emailVerified(true)
                            .build();
                    userRepository.save(user);
                    log.info("Seeded demo account: {} / {}", email, rawPassword);
                }
        );
    }
}
