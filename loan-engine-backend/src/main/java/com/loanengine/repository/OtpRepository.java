package com.loanengine.repository;

import com.loanengine.model.OtpToken;
import com.loanengine.model.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<OtpToken, Long> {
    List<OtpToken> findByEmailAndTypeAndUsedFalseOrderByCreatedAtDesc(String email, OtpType type);
    Optional<OtpToken> findTopByEmailAndTypeAndUsedFalseOrderByCreatedAtDesc(String email, OtpType type);
}
