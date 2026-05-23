package com.loanengine.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "loan_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "loan_amount", nullable = false)
    private BigDecimal loanAmount;

    @Column(nullable = false)
    private int tenureMonths;

    @Column(name = "annual_income", nullable = false)
    private BigDecimal annualIncome;

    @Column(name = "existing_emi", nullable = false)
    private BigDecimal existingEmi;

    @Column(name = "credit_score", nullable = false)
    private int creditScore;

    @Column(name = "employment_type", nullable = false)
    private String employmentType;

    @Column(name = "employment_years", nullable = false)
    private int employmentYears;

    @Column(name = "loan_purpose")
    private String loanPurpose;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
